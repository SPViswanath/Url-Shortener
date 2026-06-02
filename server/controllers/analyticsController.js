const Click = require('../models/Click');
const Url = require('../models/Url');

/* ================= GET ANALYTICS FOR A URL ================= */
const getAnalytics = async (req, res) => {
  try {
    const { urlId } = req.params;

    // Verify the URL belongs to the user
    const url = await Url.findOne({
      _id: urlId,
      userId: req.userId,
    });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Get total click count
    const totalClicks = url.clickCount;

    // Get last visited time
    const lastClick = await Click.findOne({ urlId })
      .sort({ timestamp: -1 })
      .select('timestamp');

    // Get recent visits (last 10)
    const recentVisits = await Click.find({ urlId })
      .sort({ timestamp: -1 })
      .limit(10)
      .select('timestamp browser os device referrer');

    // Get browser breakdown
    const browserStats = await Click.aggregate([
      { $match: { urlId: url._id } },
      { $group: { _id: '$browser', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Get OS breakdown
    const osStats = await Click.aggregate([
      { $match: { urlId: url._id } },
      { $group: { _id: '$os', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Get device breakdown
    const deviceStats = await Click.aggregate([
      { $match: { urlId: url._id } },
      { $group: { _id: '$device', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      data: {
        url: {
          id: url._id,
          title: url.title,
          originalUrl: url.originalUrl,
          shortCode: url.shortCode,
          shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
          createdAt: url.createdAt,
          expiresAt: url.expiresAt,
          isExpired: url.isExpired,
        },
        analytics: {
          totalClicks,
          lastVisited: lastClick?.timestamp || null,
          recentVisits,
          browserStats,
          osStats,
          deviceStats,
        },
      },
    });
  } catch (err) {
    console.error('Get analytics error:', err);
    res.status(500).json({ message: 'Failed to fetch analytics', error: err.message });
  }
};

/* ================= GET CLICK HISTORY (Paginated) ================= */
const getClickHistory = async (req, res) => {
  try {
    const { urlId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Verify ownership
    const url = await Url.findOne({
      _id: urlId,
      userId: req.userId,
    });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    const totalClicks = await Click.countDocuments({ urlId });
    const clicks = await Click.find({ urlId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .select('timestamp browser os device referrer ip');

    res.status(200).json({
      data: {
        clicks,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalClicks / limit),
          totalClicks,
          hasMore: skip + limit < totalClicks,
        },
      },
    });
  } catch (err) {
    console.error('Get click history error:', err);
    res.status(500).json({ message: 'Failed to fetch click history', error: err.message });
  }
};

/* ================= GET DAILY CLICK TRENDS ================= */
const getDailyClicks = async (req, res) => {
  try {
    const { urlId } = req.params;
    const days = parseInt(req.query.days) || 30;

    // Verify ownership
    const url = await Url.findOne({
      _id: urlId,
      userId: req.userId,
    });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Calculate start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Aggregate clicks by day
    const dailyClicks = await Click.aggregate([
      {
        $match: {
          urlId: url._id,
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          clicks: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill in missing days with 0 clicks
    const filledData = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const found = dailyClicks.find((d) => d._id === dateStr);
      filledData.push({
        date: dateStr,
        clicks: found ? found.clicks : 0,
      });
    }

    res.status(200).json({
      data: {
        period: `${days} days`,
        dailyClicks: filledData,
      },
    });
  } catch (err) {
    console.error('Get daily clicks error:', err);
    res.status(500).json({ message: 'Failed to fetch daily clicks', error: err.message });
  }
};

module.exports = { getAnalytics, getClickHistory, getDailyClicks };
