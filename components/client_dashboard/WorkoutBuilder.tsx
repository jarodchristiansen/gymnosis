import { useState } from "react";
import Modal from "react-modal";
import styled from "styled-components";
import WorkoutGoalForm from "./WorkoutGoalForm";

const WorkoutBuilder = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  return (
    <WorkoutBuilderContainer>
      <button onClick={() => setModalIsOpen(true)}>Open Modal</button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Client Goal Modal"
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.75)",
          },
          content: {
            width: "90%",
            margin: "auto",
            height: "80%",
            marginTop: "7%",
          },
          // content: {
          //     border: "none",
          //     background: "none",
          //     padding: "none",
          //     inset: "none",
          //     display: "flex",
          //     justifyContent: "center",
          //     alignItems: "center",
          // },
        }}
      >
        <h2>Client Goal</h2>

        <WorkoutGoalForm />
      </Modal>
    </WorkoutBuilderContainer>
  );
};

const WorkoutBuilderContainer = styled.div`
  display: flex;
  flex-direction: column;
  border: 2px solid black;
`;

export default WorkoutBuilder;
