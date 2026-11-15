import { Eyebrow, Stamp } from "@/components/ui";
import { Colors, FontFamily, MediaQueries } from "@/styles/variables";
import styled from "styled-components";

// The same example the demo gym starts with: Riley's draft, held up by a knee-injury flag.
const DAYS = [
  {
    day: 1,
    focus: "Lower body",
    exercises: [
      { name: "Box jumps", dose: "3 × 8", flagged: true },
      { name: "Romanian deadlift", dose: "3 × 8" },
      { name: "Glute bridge", dose: "3 × 12" },
    ],
  },
  {
    day: 3,
    focus: "Upper body",
    exercises: [
      { name: "Dumbbell bench press", dose: "3 × 10" },
      { name: "Seated cable row", dose: "3 × 10" },
    ],
  },
];

/**
 * A plan under review, drawn as a training sheet on a clipboard. Static: it's an illustration of
 * the product, built from text so it renders with the page rather than as an image.
 */
const PlanSheetPreview = () => (
  <Figure>
    <Stack>
      <BackSheet aria-hidden="true">
        <Stamp tone="ok">Approved</Stamp>
      </BackSheet>
      <Clip aria-hidden="true" />
      <Sheet>
        <Head>
          <div>
            <Eyebrow tone="muted">Plan · Week 1</Eyebrow>
            <Client>Riley Chen</Client>
            <Meta>Runner · knee injury · full gym</Meta>
          </div>
          <Stamp tone="warn">Draft</Stamp>
        </Head>

        <Table>
          <caption className="visually-hidden">
            Riley Chen&apos;s draft plan, days 1 and 3
          </caption>
          <thead>
            <tr>
              <th scope="col">Exercise</th>
              <th scope="col" className="dose">
                Sets × reps
              </th>
            </tr>
          </thead>
          {DAYS.map((day) => (
            <tbody key={day.day}>
              <tr className="day">
                <th scope="rowgroup" colSpan={2}>
                  <span className="n">D{day.day}</span> {day.focus}
                </th>
              </tr>
              {day.exercises.map((e) => (
                <tr key={e.name} className={e.flagged ? "flagged" : undefined}>
                  <td>
                    {e.flagged && (
                      <span className="visually-hidden">Flagged: </span>
                    )}
                    {e.name}
                  </td>
                  <td className="dose">{e.dose}</td>
                </tr>
              ))}
            </tbody>
          ))}
        </Table>

        <MarginNote>
          <strong>Blocks approval</strong>
          Box jumps involve jumping with a knee injury.
        </MarginNote>

        <Foot>
          <span>1 flag to resolve</span>
          <FakeButton aria-hidden="true">Approve plan</FakeButton>
        </Foot>
      </Sheet>
    </Stack>
    <figcaption>
      An example draft in review. The safety rules flagged one exercise, so the
      trainer has to change it or explain why it&apos;s safe before approving.
    </figcaption>
  </Figure>
);

const Figure = styled.figure`
  margin: 0;
  width: 100%;
  max-width: 520px;
  justify-self: center;

  figcaption {
    margin-top: 18px;
    font-size: 14px;
    color: ${Colors.midGray};
  }
`;

const Stack = styled.div`
  position: relative;
  padding: 14px 10px 30px 0;
`;

const BackSheet = styled.div`
  position: absolute;
  inset: 30px 0 0 22px;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 14px;
  background: #151413;
  border: 1px solid ${Colors.rule};
  border-radius: 8px;
  transform: rotate(2deg);
`;

// The clipboard's clip, holding the top sheet.
const Clip = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  z-index: 2;
  width: 112px;
  height: 28px;
  transform: translateX(-50%);
  background: linear-gradient(#3a3835, #2a2927);
  border: 1px solid rgba(242, 238, 232, 0.14);
  border-radius: 6px 6px 10px 10px;

  &::after {
    content: "";
    position: absolute;
    top: 7px;
    left: 50%;
    width: 36px;
    height: 8px;
    transform: translateX(-50%);
    border-radius: 4px;
    background: ${Colors.richBlack};
  }
`;

const Sheet = styled.div`
  position: relative;
  z-index: 1;
  padding: 30px 20px 18px;
  background: ${Colors.surface};
  border: 1px solid rgba(242, 238, 232, 0.12);
  border-radius: 8px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);

  @media ${MediaQueries.MD} {
    padding: 34px 28px 22px;
  }
`;

const Head = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 2px solid rgba(242, 238, 232, 0.16);

  p {
    margin-bottom: 2px;
  }
`;

const Client = styled.p`
  && {
    margin: 0;
  }
  font-family: ${FontFamily.display};
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: ${Colors.lightGray};
  line-height: 1.1;
`;

const Meta = styled.p`
  && {
    margin: 2px 0 0;
  }
  font-size: 13px;
  color: ${Colors.midGray};
`;

const Table = styled.table`
  width: 100%;
  margin-top: 6px;
  border-collapse: collapse;
  font-size: 15px;

  thead th {
    padding: 10px 0 6px;
    font-family: ${FontFamily.display};
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    text-align: left;
    color: ${Colors.midGray};
  }

  .dose {
    text-align: right;
    white-space: nowrap;
  }

  tr.day th {
    padding: 14px 0 4px;
    font-weight: 650;
    text-align: left;
    color: ${Colors.lightGray};
  }

  .n {
    margin-right: 6px;
    font-family: ${FontFamily.display};
    font-weight: 700;
    color: ${Colors.brand.accentLight};
  }

  td {
    padding: 8px 0;
    border-top: 1px solid ${Colors.rule};
    color: ${Colors.lightGray};
  }

  td.dose {
    color: ${Colors.midGray};
  }

  /* The flagged line, marked the way a coach would: red pencil under it. */
  tr.flagged td:first-child {
    text-decoration: underline wavy ${Colors.flag.block};
    text-decoration-thickness: 1.5px;
    text-underline-offset: 5px;
  }

  tr.flagged td:first-child::before {
    content: "!";
    display: inline-grid;
    place-items: center;
    width: 18px;
    height: 18px;
    margin-right: 8px;
    border: 1.5px solid ${Colors.flag.block};
    border-radius: 50%;
    font-size: 12px;
    font-weight: 800;
    color: ${Colors.flag.block};
    vertical-align: 1px;
  }
`;

const MarginNote = styled.p`
  margin: 14px 0 0;
  padding: 10px 12px;
  border-left: 3px solid ${Colors.flag.block};
  background: rgba(255, 138, 122, 0.08);
  border-radius: 0 6px 6px 0;
  font-size: 14px;
  color: ${Colors.lightGray};

  strong {
    display: block;
    margin-bottom: 2px;
    font-family: ${FontFamily.display};
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${Colors.flag.block};
  }
`;

const Foot = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
  font-size: 14px;
  color: ${Colors.midGray};
`;

const FakeButton = styled.span`
  padding: 9px 14px;
  border-radius: 6px;
  background: ${Colors.brand.accent};
  color: ${Colors.ink};
  font-size: 14px;
  font-weight: 650;
  opacity: 0.45;
`;

export default PlanSheetPreview;
