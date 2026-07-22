// backend/controllers/stats.js
const Application = require('../models/Application');

exports.getStats = async (req, res, next) => {
  try {
    console.log('[getStats] Fetching statistics...');

    const statuses = ['Sent', 'Viewed', 'Interview', 'Test', 'Offer', 'Rejected', 'Archived'];

    const [
      statusDistribution,
      timeline,
      topSources,
      totalApplications,
      offerCount,
      funnelCounts
    ] = await Promise.all([
      Application.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } }
      ]),
      Application.aggregate([
        { $match: { appliedDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$appliedDate' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Application.aggregate([
        { $match: { source: { $ne: null, $ne: '' } } },
        { $group: { _id: '$source', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      Application.countDocuments(),
      Application.countDocuments({ status: 'Offer' }),
      Promise.all(statuses.map(status =>
        Application.countDocuments({ 'statusHistory.status': status })
      ))
    ]);

    const funnel = statuses.map((status, index) => ({
      stage: status,
      count: funnelCounts[index] || 0
    }));

    const data = {
      statusDistribution: statusDistribution.map(item => ({ name: item.status, value: item.count })),
      timeline: timeline.map(item => ({ date: item._id, count: item.count })),
      topSources: topSources.map(item => ({ source: item._id, count: item.count })),
      funnel,
      totalApplications,
      offerCount,
      offerRate: totalApplications > 0 ? Math.round((offerCount / totalApplications) * 100) : 0,
    };

    console.log('[getStats] Statistics computed successfully');
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('[getStats] Error:', err);
    next(err);
  }
};