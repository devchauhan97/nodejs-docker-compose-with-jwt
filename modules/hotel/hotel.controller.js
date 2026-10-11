const hotelComparisonService = require('../../services/hotelComparisonService');

module.exports = {
  listHotels: async (req, res, next) => {
    try {
      const city = typeof req.query.city === 'string' ? req.query.city.trim() : '';
      const minPrice = req.query.minPrice === undefined ? undefined : Number(req.query.minPrice);
      const maxPrice = req.query.maxPrice === undefined ? undefined : Number(req.query.maxPrice);

      if ((req.query.minPrice !== undefined && Number.isNaN(minPrice)) ||
          (req.query.maxPrice !== undefined && Number.isNaN(maxPrice))) {
        return res.status(400).json({ message: 'minPrice and maxPrice must be valid numbers.' });
      }

      if (Number.isFinite(minPrice) && Number.isFinite(maxPrice) && minPrice > maxPrice) {
        return res.status(400).json({ message: 'minPrice cannot be greater than maxPrice.' });
      }

      const response = await hotelComparisonService.compareHotels({ city, minPrice, maxPrice });

      return res.status(200).json({
        message: 'Hotel comparison complete.',
        ...response
      });
    } catch (error) {
      console.error(error);
      return next(error);
    }
  },

  compareHotels: async (req, res, next) => {
    try {
      const city = typeof req.query.city === 'string' ? req.query.city.trim() : '';
      const minPrice = req.query.minPrice === undefined ? undefined : Number(req.query.minPrice);
      const maxPrice = req.query.maxPrice === undefined ? undefined : Number(req.query.maxPrice);

      if ((req.query.minPrice !== undefined && Number.isNaN(minPrice)) ||
          (req.query.maxPrice !== undefined && Number.isNaN(maxPrice))) {
        return res.status(400).json({ message: 'minPrice and maxPrice must be valid numbers.' });
      }

      if (Number.isFinite(minPrice) && Number.isFinite(maxPrice) && minPrice > maxPrice) {
        return res.status(400).json({ message: 'minPrice cannot be greater than maxPrice.' });
      }

      const response = await hotelComparisonService.compareHotels({ city, minPrice, maxPrice });

      return res.status(200).json({
        message: 'Hotel comparison complete.',
        ...response
      });
    } catch (error) {
      console.error(error);
      return next(error);
    }
  }
};
