import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../../components/ui/Button";
import { getProjectMembers } from "../../../services/endpoints";
import NewMembersPopup from "../../../components/members/NewMembersPopup";
import { ICONS } from "../../../assets";
import { getInitials } from "../../../components/utils/nameUtils";
import type { ApiMember } from "../../../types/apiTypes";
import ErrorContent from "../../../components/common/Content/ErrorContent";

type Member = {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
};

const roleBadgeStyles: Record<Member["role"], string> = {
  OWNER: "bg-[#1D4ED8] text-white",
  ADMIN: "bg-[#CDDDFF] text-[#51617E]",
  MEMBER: "bg-[#D7E2FF] text-[#434654]",
  VIEWER: "bg-[#E8EDFF] text-[#434654]",
};

const avatarRoleStyles: Record<Member["role"], string> = {
  OWNER: "bg-[#DAE2FF] text-[#003D9B]",
  ADMIN: "bg-[#34D399] text-[#002113]",
  MEMBER: "bg-[#34D399] text-[#002113]",
  VIEWER: "bg-[#DAE2FF] text-[#091C35]",
};

export default function Members() {
  const [loading, setLoading] = useState<boolean>(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!projectId) return;

    const fetchMembers = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getProjectMembers(projectId);

        const data: ApiMember[] = Array.isArray(res)
          ? res
          : Array.isArray((res as { data: ApiMember[] })?.data)
            ? (res as { data: ApiMember[] }).data
            : [];

        const normalized: Member[] = data.map((m) => ({
          id: m.member_id,
          name: m.metadata?.name ?? "Unknown",
          email: m.email,
          role: (m.role?.toUpperCase() as Member["role"]) || "MEMBER",
        }));

        setMembers(normalized);
      } catch (err) {
        console.error(err);
        setError("Failed to load members");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [projectId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
      <div className="hidden md:flex items-center gap-2 mt-5">
        <p
          onClick={() => navigate("/dashboard/projects")}
          className="text-[#43465499] text-[12px] font-bold uppercase cursor-pointer hover:text-[#003D9B] transition-colors"
        >
          Projects
        </p>

        <span className="text-[#43465466] text-[12px] font-bold">&gt;</span>
        <p className="text-[#003D9B] text-[12px] font-bold uppercase">
          Members
        </p>
      </div>

      <div className="flex items-center justify-center sm:justify-between mt-5 md:mt-0">
        <h2 className="text-[#041B3C] text-[28px] font-semibold">
          Project Members
        </h2>

        <Button
          onClick={() => setOpen(true)}
          className="hidden md:flex items-center gap-2 px-4"
        >
          <svg
            width="19"
            height="14"
            viewBox="0 0 19 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.1667 8.33333V5.83333H11.6667V4.16667H14.1667V1.66667H15.8333V4.16667H18.3333V5.83333H15.8333V8.33333H14.1667ZM6.66667 6.66667C5.75 6.66667 4.96528 6.34028 4.3125 5.6875C3.65972 5.03472 3.33333 4.25 3.33333 3.33333C3.33333 2.41667 3.65972 1.63194 4.3125 0.979167C4.96528 0.326389 5.75 0 6.66667 0C7.58333 0 8.36806 0.326389 9.02083 0.979167C9.67361 1.63194 10 2.41667 10 3.33333C10 4.25 9.67361 5.03472 9.02083 5.6875C8.36806 6.34028 7.58333 6.66667 6.66667 6.66667ZM0 13.3333V11C0 10.5278 0.121528 10.0938 0.364583 9.69792C0.607639 9.30208 0.930556 9 1.33333 8.79167C2.19444 8.36111 3.06944 8.03819 3.95833 7.82292C4.84722 7.60764 5.75 7.5 6.66667 7.5C7.58333 7.5 8.48611 7.60764 9.375 7.82292C10.2639 8.03819 11.1389 8.36111 12 8.79167C12.4028 9 12.7257 9.30208 12.9688 9.69792C13.2118 10.0938 13.3333 10.5278 13.3333 11V13.3333H0ZM1.66667 11.6667H11.6667V11C11.6667 10.8472 11.6285 10.7083 11.5521 10.5833C11.4757 10.4583 11.375 10.3611 11.25 10.2917C10.5 9.91667 9.74306 9.63542 8.97917 9.44792C8.21528 9.26042 7.44444 9.16667 6.66667 9.16667C5.88889 9.16667 5.11806 9.26042 4.35417 9.44792C3.59028 9.63542 2.83333 9.91667 2.08333 10.2917C1.95833 10.3611 1.85764 10.4583 1.78125 10.5833C1.70486 10.7083 1.66667 10.8472 1.66667 11V11.6667ZM6.66667 5C7.125 5 7.51736 4.83681 7.84375 4.51042C8.17014 4.18403 8.33333 3.79167 8.33333 3.33333C8.33333 2.875 8.17014 2.48264 7.84375 2.15625C7.51736 1.82986 7.125 1.66667 6.66667 1.66667C6.20833 1.66667 5.81597 1.82986 5.48958 2.15625C5.16319 2.48264 5 2.875 5 3.33333C5 3.79167 5.16319 4.18403 5.48958 4.51042C5.81597 4.83681 6.20833 5 6.66667 5Z"
              fill="white"
            />
          </svg>
          Invite Member
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-[0px_1px_2px_0px_#0000000D] overflow-hidden">
        <div className="hidden md:grid grid-cols-12 px-6 py-3 bg-[#E0E8FF4D]">
          <div className="col-span-7 text-[11px] font-bold text-[#434654] uppercase tracking-wider">
            {loading ? (
              <div className="w-16 h-3 rounded-sm bg-[#E8EDFF] animate-pulse" />
            ) : (
              "Member"
            )}
          </div>
          <div className="col-span-3 text-[11px] font-bold text-[#434654] uppercase tracking-wider">
            {loading ? (
              <div className="w-10 h-3 rounded-sm bg-[#E8EDFF] animate-pulse" />
            ) : (
              "Role"
            )}
          </div>
          <div className="col-span-2 text-right text-[11px] font-bold text-[#434654] uppercase tracking-wider">
            {loading ? (
              <div className="w-12 h-3 rounded-sm bg-[#E8EDFF] animate-pulse ml-auto" />
            ) : (
              "Actions"
            )}
          </div>
        </div>


      {error? (
        <ErrorContent
          title="Something went wrong"
          icon={<img src={ICONS.error} alt="error" className="w-6 h-6" />}
          description="We're having trouble retrieving your
            project members right now. Please try
            again in a moment."
        >
          <Button onClick={() => window.location.reload()}>
            Retry connection
          </Button>
        </ErrorContent>
      ) : loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-12 px-6 py-4 items-center border-b border-[#F3F4F6] last:border-b-0"
            >
             
              <div className="col-span-7 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8EDFF] animate-pulse shrink-0" />
                <div className="flex flex-col gap-2">
                  <div className="w-32 h-3 rounded-sm bg-[#E8EDFF] animate-pulse" />
                  <div className="w-44 h-2.5 rounded-sm bg-[#E8EDFF] animate-pulse" />
                </div>
              </div>

             
              <div className="col-span-3">
                <div className="w-16 h-5 rounded-xl bg-[#E8EDFF] animate-pulse" />
              </div>

              <div className="col-span-2 flex justify-end">
                <div className="w-6 h-6 rounded bg-[#E8EDFF] animate-pulse" />
              </div>
            </div>
          ))
        ) : members.length === 0 ? (
          <div className="p-6 text-center text-gray-400">No members found</div>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="grid grid-cols-12 px-6 py-4 items-center border-b border-[#F3F4F6] last:border-b-0 hover:bg-[#F9FAFB] transition-colors"
            >
              <div className="col-span-7 flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[13px] shrink-0 ${
                    avatarRoleStyles[member.role]
                  }`}
                >
                  {getInitials(member.name)}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#041B3C]">
                    {member.name}
                  </p>
                  <p className="text-[12px] text-[#6B7280]">{member.email}</p>
                </div>
              </div>

              <div className="col-span-3 hidden sm:block">
                <span
                  className={`text-[11px] px-3 py-1 rounded-xl font-semibold uppercase tracking-wide ${
                    roleBadgeStyles[member.role]
                  }`}
                >
                  {member.role}
                </span>
              </div>

              <div className="col-span-5 sm:col-span-2 flex  justify-end">
                <div className="flex flex-col">
                 <span
                  className={`text-[11px] px-3 py-1 md:hidden rounded-sm font-semibold uppercase tracking-wide ${
                    roleBadgeStyles[member.role]
                  }`}
                >
                  {member.role}
                </span>
                {member.role !== "OWNER" && (
                  <button
                    className="p-1 rounded hover:bg-[#E5E7EB] transition-colors cursor-pointer"
                    aria-label="More actions"
                  >
                    <svg
                      width="4"
                      height="16"
                      viewBox="0 0 4 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2 16C1.45 16 0.979167 15.8042 0.5875 15.4125C0.195833 15.0208 0 14.55 0 14C0 13.45 0.195833 12.9792 0.5875 12.5875C0.979167 12.1958 1.45 12 2 12C2.55 12 3.02083 12.1958 3.4125 12.5875C3.80417 12.9792 4 13.45 4 14C4 14.55 3.80417 15.0208 3.4125 15.4125C3.02083 15.8042 2.55 16 2 16ZM2 10C1.45 10 0.979167 9.80417 0.5875 9.4125C0.195833 9.02083 0 8.55 0 7.45 0.195833 6.97917 0.5875 6.5875C0.979167 6.19583 1.45 6 2 6C2.55 6 3.02083 6.19583 3.4125 6.5875C3.80417 6.97917 4 7.45 4 8C4 8.55 3.80417 9.02083 3.4125 9.4125C3.02083 9.80417 2.55 10 2 10ZM2 4C1.45 4 0.979167 3.80417 0.5875 3.4125C0.195833 3.02083 0 2.55 0 2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0C2.55 0 3.02083 0.195833 3.4125 0.5875C3.80417 0.979167 4 1.45 4 2C4 2.55 3.80417 3.02083 3.4125 3.4125C3.02083 3.80417 2.55 4 2 4Z"
                        fill="#434654"
                      />
                    </svg>
                  </button>
                )}
                </div>

              </div>
            </div>
          ))
        )}
      </div>

      {open && <NewMembersPopup onClose={() => setOpen(false)} />}
    </div>
  );
}
