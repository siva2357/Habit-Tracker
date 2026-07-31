const HabitTracker = require('../models/HabitTracker');

exports.getAll = async (req, res) => {
  try {
    const userId = req.user._id; 
    const items = await HabitTracker.find({ user: userId }).sort({ createdAt: -1 });

    // Compute stats
    let allTimeCompleted = 0;
    let allTimeEntries = 0;
    const dailyActivity = {};

    items.forEach(h => {
      if (h.tracking) {
        for (const [dateKey, val] of h.tracking.entries()) {
          allTimeEntries++;
          if (val === true) {
            allTimeCompleted++;
            dailyActivity[dateKey] = true;
          }
        }
      }
    });

    const overallPct = allTimeEntries > 0 ? Math.round((allTimeCompleted / allTimeEntries) * 100) : 0;

    const sortedDates = Object.keys(dailyActivity).sort();
    let currentStreak = 0;
    let longestStreak = 0;

    if (sortedDates.length > 0) {
      let tempStreak = 1;
      let maxStreak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i-1]);
        const currDate = new Date(sortedDates[i]);
        const diffTime = Math.abs(currDate - prevDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          tempStreak++;
          if (tempStreak > maxStreak) maxStreak = tempStreak;
        } else {
          tempStreak = 1;
        }
      }
      longestStreak = maxStreak;

      const today = new Date();
      today.setHours(0,0,0,0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const todayStr = today.toISOString().split('T')[0];
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let lastActiveIndex = sortedDates.length - 1;
      const lastActiveDateStr = sortedDates[lastActiveIndex];
      
      if (lastActiveDateStr === todayStr || lastActiveDateStr === yesterdayStr) {
        currentStreak = 1;
        for (let i = lastActiveIndex; i > 0; i--) {
          const d1 = new Date(sortedDates[i]);
          const d2 = new Date(sortedDates[i-1]);
          const diffDays = Math.ceil(Math.abs(d1 - d2) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    const stats = {
      overallPct,
      currentStreak,
      longestStreak,
      totalDone: allTimeCompleted
    };

    res.json({ stats, items });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const userId = req.user._id;
    const newItem = new HabitTracker({ ...req.body, user: userId });
    const saved = await newItem.save();
    res.status(201).json(saved);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const userId = req.user._id;
    const updated = await HabitTracker.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      req.body,
      { returnDocument: 'after' }
    );
    if (!updated) return res.status(401).json({ message: 'Not authorized or not found' });
    res.json(updated);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.delete = async (req, res) => {
  try {
    const userId = req.user._id;
    const deleted = await HabitTracker.findOneAndDelete({ _id: req.params.id, user: userId });
    if (!deleted) return res.status(401).json({ message: 'Not authorized or not found' });
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
};