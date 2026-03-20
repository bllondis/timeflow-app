import { useQuery } from "@tanstack/react-query";
import {
  getCatchupDays,
  getDeadline,
  getProjects,
  getTeamMembers,
  getTimesheetApprovals,
  getWeekData,
} from "@/services/timeflow";

export const useProjectsQuery = () =>
  useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

export const useWeekDataQuery = () =>
  useQuery({
    queryKey: ["week-data"],
    queryFn: getWeekData,
  });

export const useCatchupDaysQuery = () =>
  useQuery({
    queryKey: ["catchup-days"],
    queryFn: getCatchupDays,
  });

export const useTeamMembersQuery = () =>
  useQuery({
    queryKey: ["team-members"],
    queryFn: getTeamMembers,
  });

export const useDeadlineQuery = () =>
  useQuery({
    queryKey: ["deadline"],
    queryFn: getDeadline,
  });

export const useTimesheetApprovalsQuery = () =>
  useQuery({
    queryKey: ["timesheet-approvals"],
    queryFn: getTimesheetApprovals,
  });
