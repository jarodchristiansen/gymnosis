import { Colors } from "@/styles/variables";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import styled from "styled-components";

const ROLES = [
  {
    role: "trainer",
    label: "Try as a trainer",
    hint: "Review drafts, resolve safety flags, approve and send plans.",
  },
  {
    role: "client",
    label: "Try as a client",
    hint: "See only the plan your trainer sent you.",
  },
  {
    role: "owner",
    label: "Try as the gym owner",
    hint: "See every trainer's clients and plans.",
  },
];

/**
 * One click into a private demo gym with example data. No sign-up; it expires after a day.
 */
const DemoLauncher = () => {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const start = async (role: string) => {
    setBusy(role);
    setError("");
    const result = await signIn("demo", { role, redirect: false });
    if (result?.ok && !result.error) {
      router.push("/demo/start");
      return;
    }
    setBusy("");
    setError(result?.error ?? "Couldn't start the demo. Try again.");
  };

  return (
    <Wrap>
      <Options>
        {ROLES.map(({ role, label, hint }) => (
          <li key={role}>
            <Option
              type="button"
              onClick={() => start(role)}
              disabled={!!busy}
              aria-describedby={`demo-${role}-hint`}
            >
              {busy === role ? "Setting up your demo gym…" : label}
            </Option>
            <Hint id={`demo-${role}-hint`}>{hint}</Hint>
          </li>
        ))}
      </Options>
      <Note>
        Each demo is a private gym with example clients and plans, just for you.
        It&apos;s deleted after 24 hours.
      </Note>
      {error && <Problem role="alert">{error}</Problem>}
    </Wrap>
  );
};

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Options = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
`;

const Option = styled.button`
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid ${Colors.brand.accent};
  background: transparent;
  color: ${Colors.brand.white};
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: rgba(255, 107, 43, 0.12);
  }

  &:disabled {
    opacity: 0.6;
    cursor: progress;
  }

  &:focus-visible {
    outline: 2px solid ${Colors.brand.white};
    outline-offset: 2px;
  }
`;

const Hint = styled.p`
  margin: 6px 2px 0;
  font-size: 13px;
  color: ${Colors.midGray};
`;

const Note = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${Colors.midGray};
`;

const Problem = styled.p`
  margin: 0;
  font-size: 14px;
  color: #ff8a80;
`;

export default DemoLauncher;
