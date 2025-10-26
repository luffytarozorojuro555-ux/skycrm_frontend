import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const STATUS_MAP = {
  success: ["Enrolled", "Closed", "Won", "Converted"],
  failed: ["Not Interested", "UnIntrstd"],
  new: ["New"],
};

const COLORS = {
  success: "#22C55E",
  failed: "#EF4444",
  processing: "#F59E0B",
  new: "#6366F1",
};

const TeamMemberPerformance = ({ leadsGroupedByMember, users }) => {
  /**
   * leadsGroupedByMember: { [userId]: [lead1, lead2, ...] }
   * users: [{_id, name, email, phone}] - to map userId to name
   */

  const memberStats = useMemo(() => {
    if (!leadsGroupedByMember) return [];

    return Object.entries(leadsGroupedByMember).map(([userId, leads]) => {
      const success = leads.filter((l) =>
        STATUS_MAP.success.includes(l.status?.name)
      ).length;

      const failed = leads.filter((l) =>
        STATUS_MAP.failed.includes(l.status?.name)
      ).length;

      const newLeads = leads.filter((l) =>
        STATUS_MAP.new.includes(l.status?.name)
      ).length;

      const processing =
        leads.length - (success + failed + newLeads);

      const total = leads.length;
      const successRate = total > 0 ? Math.round((success / total) * 100) : 0;

      const pieData = [
        { name: "Success", value: success, color: COLORS.success },
        { name: "Failed", value: failed, color: COLORS.failed },
        { name: "Processing", value: processing, color: COLORS.processing },
        { name: "New", value: newLeads, color: COLORS.new },
      ].filter((d) => d.value > 0); // Remove zero-value slices

      const user = users?.find((u) => u._id === userId) || { name: "Unassigned" };

      return {
        id: userId,
        name: user.name,
        leads: total,
        success,
        failed,
        processing,
        new: newLeads,
        successRate,
        pieData,
      };
    });
  }, [leadsGroupedByMember, users]);

  if (!memberStats.length) {
    return <p className="text-gray-500 dark:text-gray-400">No data available</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {memberStats.map((member) => (
        <div
          key={member.id}
          className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col gap-4 shadow hover:shadow-lg transition"
        >
          {/* Member Name */}
          <div className="font-semibold text-gray-800 dark:text-gray-100 text-lg">
            {member.name}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Left Column - Stats */}
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Leads:</span>
                <span className="font-bold text-gray-900 dark:text-gray-100">{member.leads}</span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Processing:</span>
                <span className="font-bold text-yellow-500">{member.processing}</span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Success:</span>
                <span className="font-bold text-green-400">{member.success}</span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Failed:</span>
                <span className="font-bold text-red-800">{member.failed}</span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>New:</span>
                <span className="font-bold text-blue-500">{member.new}</span>
              </div>
            </div>

            {/* Right Column - Pie Chart */}
            <div className="flex flex-col items-center justify-center">
              {member.pieData.length > 0 ? (
                <>
                  <div className="w-24 h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={member.pieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={20}
                          outerRadius={35}
                          paddingAngle={2}
                        >
                          {member.pieData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-col gap-1 mt-2 text-xs">
                    {member.pieData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span>{item.name}: {item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-400 text-xs">
                  No Data
                </div>
              )}
            </div>
          </div>

          {/* Success Rate Badge */}
          <div className="flex justify-center py-1 px-3 bg-blue-50 dark:bg-blue-900 border border-blue-100 dark:border-blue-800 rounded-lg">
            <span className="text-blue-700 dark:text-blue-300 text-sm font-bold">
              Success Rate: {member.successRate}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeamMemberPerformance;
