import { Colors, MediaQueries } from "@/styles/variables";
import Image from "next/image";
import { useState } from "react";
import styled from "styled-components";
import WorkoutView from "./WorkoutView";

interface Exercise {
  exercise: string;
  sets: number;
  reps: number;
}

interface WorkoutRoutineDay {
  day: number;
  bodyPart: string;
  exercises: Exercise[];
}

export interface WorkoutHistoryEntry {
  date: string;
  routine: WorkoutRoutineDay[];
}

interface ClientUser {
  id?: string;
  name?: string;
  email?: string;
  username?: string;
  image?: string;
  createAt?: string;
  workoutHistory?: WorkoutHistoryEntry[];
}

interface DashboardContainerProps {
  session: {
    user?: {
      id?: string;
      name?: string;
      email?: string;
      role?: string;
    };
  };
  clientId: string;
  clientUser?: ClientUser;
}

type Tab = "Workouts" | "MealPlan" | "History";

const TABS: { key: Tab; label: string }[] = [
  { key: "Workouts", label: "Workouts" },
  { key: "MealPlan", label: "Meal Plan" },
  { key: "History", label: "History" },
];

const getInitials = (name: string): string => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const DashboardContainer = ({
  clientId,
  clientUser,
}: DashboardContainerProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("Workouts");

  const { name, email, username, image, createAt } = clientUser ?? {};

  const renderTabContent = () => {
    switch (activeTab) {
      case "Workouts":
        return (
          <WorkoutView
            clientId={clientId}
            workoutHistory={clientUser?.workoutHistory ?? []}
          />
        );
      case "MealPlan":
        return (
          <PlaceholderPane>
            <PlaceholderIcon>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                <line x1="6" y1="1" x2="6" y2="4" />
                <line x1="10" y1="1" x2="10" y2="4" />
                <line x1="14" y1="1" x2="14" y2="4" />
              </svg>
            </PlaceholderIcon>
            <h3>Meal Plans Coming Soon</h3>
            <p>Nutrition planning will be available in a future update.</p>
          </PlaceholderPane>
        );
      case "History":
        return (
          <PlaceholderPane>
            <PlaceholderIcon>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </PlaceholderIcon>
            <h3>Progress Tracking Coming Soon</h3>
            <p>
              Full workout history and progress charts will be available soon.
            </p>
          </PlaceholderPane>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardWrap>
      <ProfileSection>
        <AvatarWrap>
          {image ? (
            <Image
              src={image}
              alt={`${name ?? "Client"} profile photo`}
              width={80}
              height={80}
              style={{ borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            <AvatarFallback>{getInitials(name ?? "")}</AvatarFallback>
          )}
        </AvatarWrap>

        <InfoGrid>
          <InfoCard>
            <InfoLabel>Contact</InfoLabel>
            <InfoValue>{name ?? "—"}</InfoValue>
            <InfoMuted>{email ?? "—"}</InfoMuted>
          </InfoCard>

          <InfoCard>
            <InfoLabel>Username</InfoLabel>
            <InfoValue>{username ? `@${username}` : "—"}</InfoValue>
            <RoleBadge>Client</RoleBadge>
          </InfoCard>

          <InfoCard>
            <InfoLabel>Member Since</InfoLabel>
            <InfoValue>{createAt ? formatDate(createAt) : "—"}</InfoValue>
          </InfoCard>
        </InfoGrid>
      </ProfileSection>

      <TabsSection>
        <TabBar role="tablist" aria-label="Client dashboard sections">
          {TABS.map(({ key, label }) => (
            <TabButton
              key={key}
              role="tab"
              type="button"
              aria-selected={activeTab === key}
              active={activeTab === key}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </TabButton>
          ))}
        </TabBar>

        <TabContent>{renderTabContent()}</TabContent>
      </TabsSection>
    </DashboardWrap>
  );
};

const DashboardWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  color: ${Colors.brand.white};
`;

const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 28px;
  background: ${Colors.surface};
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;

  @media ${MediaQueries.LG} {
    flex-direction: row;
    align-items: flex-start;
    gap: 32px;
  }
`;

const AvatarWrap = styled.div`
  flex-shrink: 0;
`;

const AvatarFallback = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    ${Colors.brand.accent},
    ${Colors.brand.accentHover}
  );
  color: white;
  font-size: 26px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 1px;
`;

const InfoGrid = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;

  @media ${MediaQueries.MD} {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
`;

const InfoCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
`;

const InfoLabel = styled.span`
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: ${Colors.midGray};
`;

const InfoValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${Colors.brand.white};
  margin-top: 2px;
`;

const InfoMuted = styled.span`
  font-size: 12px;
  color: ${Colors.midGray};
`;

const RoleBadge = styled.span`
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  color: ${Colors.brand.accent};
  background: rgba(255, 107, 43, 0.12);
  border: 1px solid rgba(255, 107, 43, 0.2);
  border-radius: 4px;
  padding: 2px 8px;
  width: fit-content;
  margin-top: 4px;
`;

const TabsSection = styled.div`
  display: flex;
  flex-direction: column;
  background: ${Colors.surface};
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
  overflow: hidden;
`;

const TabBar = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  padding: 0 4px;
`;

const TabButton = styled.button<{ active: boolean }>`
  padding: 14px 20px;
  font-size: 14px;
  font-weight: 600;
  color: ${({ active }) => (active ? Colors.brand.accent : Colors.midGray)};
  background: none;
  border: none;
  border-bottom: 2px solid
    ${({ active }) => (active ? Colors.brand.accent : "transparent")};
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease;
  margin-bottom: -1px;

  &:hover {
    color: ${({ active }) =>
      active ? Colors.brand.accent : Colors.brand.white};
  }
`;

const TabContent = styled.div`
  padding: 28px;
`;

const PlaceholderPane = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
  text-align: center;
  color: ${Colors.midGray};

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: ${Colors.brand.white};
    margin: 16px 0 8px;
  }

  p {
    font-size: 14px;
    line-height: 1.6;
    max-width: 300px;
    margin: 0;
  }
`;

const PlaceholderIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${Colors.midGray};
`;

export default DashboardContainer;
