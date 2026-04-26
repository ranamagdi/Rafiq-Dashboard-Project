import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../../components/ui/Button";
import { getProjectMembers } from "../../../services/endpoints";
import {InviteMembers,RoleIcon} from '../../../components/ui/SvgIcons'
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
         <InviteMembers/>
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
                   <RoleIcon/>
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
