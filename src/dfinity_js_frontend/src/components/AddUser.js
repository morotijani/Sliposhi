import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Form, FloatingLabel } from "react-bootstrap";
import profileImg from "../../assets/img/profile.jpg";

const AddUser = ({ save }) => {
  const [internet_identity, setInternet_identity] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [attachmentURL, setImage] = useState("");
  const [price, setPrice] = useState(0);
  const isFormFilled = () => title && attachmentURL && description && location && price;

  return (
    <>
        <Modal show={show} onHide={handleClose} centered>
            <Form>
                <Modal.Body>
                    <FloatingLabel
                        controlId="inputName"
                        label="From"
                        className="mb-3"
                    >
                        <Form.Control
                            type="text"
                            onChange={(e) => {
                            setTitle(e.target.value);
                            }}
                            placeholder="Enter where your post is from eg.(Betpawa)"
                        />
                    </FloatingLabel>
                    <FloatingLabel
                        controlId="inputUrl"
                        label="Media URL"
                        className="mb-3"
                    >
                        <Form.Control
                            type="text"
                            placeholder="Media URL"
                            onChange={(e) => {
                            setImage(e.target.value);
                            }}
                        />
                    </FloatingLabel>
                    <FloatingLabel
                    controlId="inputDescription"
                    label="Description"
                    className="mb-3"
                    >
                    <Form.Control
                        as="textarea"
                        placeholder="description"
                        style={{ height: "80px" }}
                        onChange={(e) => {
                        setDescription(e.target.value);
                        }}
                    />
                    </FloatingLabel>
                    <FloatingLabel
                    controlId="inputLocation"
                    label="Country"
                    className="mb-3"
                    >
                    <Form.Control
                        type="text"
                        placeholder="Country"
                        onChange={(e) => {
                        setLocation(e.target.value);
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
                    title,
                    attachmentURL,
                    description,
                    location,
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
