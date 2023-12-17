import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Form, FloatingLabel } from "react-bootstrap";

const AddUser = ({ save }) => {
  const [internet_identity, setInternet_identity] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [attachmentURL, setImage] = useState("");
  const [price, setPrice] = useState(0);

  const isFormFilled = () => username && attachmentURL && email;

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);


  return (
    <>
      <input type="button" onClick={handleShow} value="Add details" className="btn btn-primary"/>

      <Modal show={show} onHide={handleClose} centered>
            <Form>
                <Modal.Body>
                    <FloatingLabel
                        controlId="inputName"
                        label="Username"
                        className="mb-3"
                    >
                        <Form.Control
                            type="text"
                            onChange={(e) => {
                            setUsername(e.target.value + '121');
                            }}
                            placeholder="Username"
                        />
                    </FloatingLabel>
                    <FloatingLabel
                        controlId="inputUrl"
                        label="Profile media URL"
                        className="mb-3"
                    >
                        <Form.Control
                            type="text"
                            placeholder="Profile media URL"
                            onChange={(e) => {
                            setImage(e.target.value);
                            }}
                        />
                    </FloatingLabel>
                    <FloatingLabel
                    controlId="inputDescription"
                    label="Email"
                    className="mb-3"
                    >
                    <Form.Control
                        type="text"
                        placeholder="Email"
                        onChange={(e) => {
                        setEmail(e.target.value);
                        }}
                    />
                    </FloatingLabel>
                    <FloatingLabel
                    controlId="inputPrice"
                    label="Price"
                    className="mb-3"
                    style={{ opacity: "0" }}
                    >
                    <Form.Control
                        type="text"
                        placeholder="Price"
                        onChange={(e) => {
                        setPrice(e.target.value);
                        }}
                    />
                    </FloatingLabel>
                </Modal.Body>
            </Form>
            <Modal.Footer>
            <Button
                variant="dark"
                disabled={!isFormFilled()}
                onClick={() => {
                save({
                    username,
                    attachmentURL,
                    email,
                    internet_identity,
                    price,
                });
                handleClose();
                }}
            >
                Post
            </Button>
            </Modal.Footer>
        </Modal>

    </>
  );
};

AddUser.propTypes = {
  save: PropTypes.func.isRequired,
};

export default AddUser;
