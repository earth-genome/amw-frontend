import { Button, Modal } from "antd";
import { ReactNode, useState } from "react";

interface ModalWrapperProps {
  children: ReactNode;
  buttonText: string;
  title: string;
}

const ModalWrapper = ({ children, buttonText, title }: ModalWrapperProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        {buttonText}
      </Button>
      <Modal
        title={title}
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        {children}
      </Modal>
    </>
  );
};

export default ModalWrapper;
