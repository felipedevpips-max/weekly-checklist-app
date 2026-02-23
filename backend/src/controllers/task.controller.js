exports.getTasks = (req, res) => {
  const tasks = [
    {
      id: 1,
      title: "Estudar 30 min",
      status: "pending",
      priority: "high"
    },
    {
      id: 2,
      title: "Treinar",
      status: "in_progress",
      priority: "medium"
    }
  ];

  res.json(tasks);
};