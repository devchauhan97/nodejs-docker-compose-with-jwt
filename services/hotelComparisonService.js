const { createClient } = require('redis');
const { Connection, Client } = require('@temporalio/client');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
  try {
    await redisClient.connect();
    console.log('Successfully connected to Redis');
  } catch (err) {
    console.error('Unable to connect to Redis. Start Redis or set REDIS_URL.', err);
  }
})();

const hotelSupplierOneApi = async () => {
  return [
    { name: 'Ocean Pearl', city: 'San Diego', supplier: 'supplier-one', price: 180, commissionPct: 20 },
    { name: 'Palm Ridge', city: 'Miami', supplier: 'supplier-one', price: 250, commissionPct: 25 },
    { name: 'Luna Stay', city: 'Seattle', supplier: 'supplier-one', price: 210, commissionPct: 22 },
    { name: 'Azure Vista', city: 'Austin', supplier: 'supplier-one', price: 160, commissionPct: 18 },
    { name: 'Mountain Hive', city: 'Denver', supplier: 'supplier-one', price: 130, commissionPct: 15 },
    { name: 'Delhi Heritage', city: 'Delhi', supplier: 'supplier-one', price: 220, commissionPct: 24 }
  ];
};

const hotelSupplierTwoApi = async () => {
  return [
    { name: 'Ocean Pearl', city: 'San Diego', supplier: 'supplier-two', price: 160, commissionPct: 16 },
    { name: 'Palm Ridge', city: 'Miami', supplier: 'supplier-two', price: 220, commissionPct: 22 },
    { name: 'Luna Stay', city: 'Seattle', supplier: 'supplier-two', price: 170, commissionPct: 17 },
    { name: 'Azure Vista', city: 'Austin', supplier: 'supplier-two', price: 140, commissionPct: 14 },
    { name: 'Park Court', city: 'Nashville', supplier: 'supplier-two', price: 100, commissionPct: 10 },
    { name: 'Delhi Heritage', city: 'Delhi', supplier: 'supplier-two', price: 205, commissionPct: 20 }
  ];
};

class TemporalHotelWorkflow {
  async run({ city = '', minPrice, maxPrice } = {}) {
    const parsedMin = typeof minPrice === 'string' ? Number(minPrice) : minPrice;
    const parsedMax = typeof maxPrice === 'string' ? Number(maxPrice) : maxPrice;
    const cityKey = typeof city === 'string' ? city.trim().toLowerCase() : '';

    const supplierOneListings = await hotelSupplierOneApi();
    const supplierTwoListings = await hotelSupplierTwoApi();

    const deduped = this.compareHotels(supplierOneListings, supplierTwoListings, { city: cityKey });

    await this.saveDedupedHotelsToRedis(cityKey, deduped.hotels);

    const filteredHotels = await this.filterHotelsInRedis(cityKey, deduped.hotels, parsedMin, parsedMax);

    return {
      hotelCount: filteredHotels.length,
      hotels: filteredHotels
    };
  }

  compareHotels(supplierOneListings, supplierTwoListings, { city = '' }) {
    const allListings = [...supplierOneListings, ...supplierTwoListings];
    const bestListings = new Map();

    for (const listing of allListings) {
      const nameKey = listing.name.trim().toLowerCase();
      const existing = bestListings.get(nameKey);

      console.log(`Comparing listing: ${nameKey}`);
      console.log(`Existing listing price: ${existing?.price}`);
       console.log(`listing price: ${listing?.price}`);

      if (!existing || listing.price < existing.price) {
        bestListings.set(nameKey, listing);
      }
    }

    const hotelList = [...bestListings.values()]
      .filter((listing) => {
        const isCityMatch = city ? listing.city.toLowerCase() === city : true;
        return isCityMatch;
      })
      .map((listing) => ({
        name: listing.name,
        city: listing.city,
        supplier: listing.supplier,
        price: listing.price,
        commissionPct: listing.commissionPct || 0,
      }));

    return {
      hotelCount: hotelList.length,
      hotels: hotelList.sort((a, b) => a.name.localeCompare(b.name))
    };
  }

  async saveDedupedHotelsToRedis(cityKey, hotels) {
    console.log(`Saving deduped hotels to Redis for city: ${cityKey || 'all'} with ${JSON.stringify(hotels)} hotels.`);
    const dedupedKey = `hotels:deduped:${cityKey || 'all'}`;
    await redisClient.set(dedupedKey, JSON.stringify(hotels));

    const priceSetKey = `hotels:price:set:${cityKey || 'all'}`;
    await redisClient.del(priceSetKey);

    for (const hotel of hotels) {
      await redisClient.zAdd(priceSetKey, [{ score: hotel.price, value: JSON.stringify(hotel) }]);
    }
  }

  async filterHotelsInRedis(cityKey, hotels, minPrice, maxPrice) {
    const priceSetKey = `hotels:price:set:${cityKey || 'all'}`;
    const minScore = Number.isFinite(minPrice) ? String(minPrice) : '-inf';
    const maxScore = Number.isFinite(maxPrice) ? String(maxPrice) : '+inf';

    const raw = await redisClient.sendCommand(['ZRANGEBYSCORE', priceSetKey, minScore, maxScore]);

    const filtered = raw.map((item) => {
      try {
        return JSON.parse(item);
      } catch (e) {
        return item;
      }
    });

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }
}

class HotelComparisonService {
  async compareHotels({ city, minPrice, maxPrice } = {}) {
    const workflowInput = { city, minPrice, maxPrice };

    try {
      const temporalAddress = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
      const temporalTaskQueue = process.env.TEMPORAL_TASK_QUEUE || 'hotel-comparison-task-queue';

      if (process.env.TEMPORAL_ENABLED !== 'false') {
        const connection = await Connection.connect({ address: temporalAddress });
        const client = new Client({ connection });

        const handle = await client.workflow.start({
          taskQueue: temporalTaskQueue,
          workflowType: 'TemporalHotelWorkflow',
          args: [workflowInput],
          workflowId: `hotel-comparison-${Date.now()}`
        });

        const response = await handle.result();
        await connection.close();
        return response;
      }
    } catch (error) {
      console.warn('Temporal workflow unavailable, falling back to the in-process workflow.', error);
    }

    const orchestrator = new TemporalHotelWorkflow();
    return orchestrator.run(workflowInput);
  }
}

module.exports = new HotelComparisonService();
