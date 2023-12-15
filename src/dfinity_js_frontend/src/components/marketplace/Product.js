import React from "react";
import PropTypes from "prop-types";
import { Card, Button, Col, Badge, Stack } from "react-bootstrap";
import { Principal } from "@dfinity/principal";
import profileImg from "../../assets/img/profile.jpg";

const Product = ({ product, buy }) => {
  const { id, price, title, description, location, attachmentURL, seller, soldAmount, createdAt } =
    product;

  const triggerBuy = () => {
    buy(id);
  };

  return (
      <div className="feed" key={id}>
            <div className="head">
                <div className="user">
                    <div className="profile-photo">
                        <img src={profileImg} />
                    </div>
                    <div className="ingo">
                        <h5>{Principal.from(seller).toText()}</h5>
                        <small>{location}, {createdAt} . {soldAmount.toString()} subscribed</small>
                    </div>
                </div>
                <span className="edit">
                    <i className="bi bi-pencil"/>
                </span>
                <span className="edit">
                    <button onClick={triggerBuy}><i className="bi bi-currency-bitcoin"/> Buy for {(price / BigInt(10**8)).toString()} ICP</button>
                </span>
            </div>
        
            <div className="photo">
                <img src={attachmentURL} alt={title} />
            </div>

            <div className="action-buttons">
                <div className="interaction-buttons">
                    <span><i className="bi bi-star-half"/></span>
                    <span><i className="bi bi-chat-left-dots"/></span>
                    <span><i className="bi bi-share"/></span>
                </div>
                <div className="bookmark">
                    <span><i className="bi bi-bookmark"/></span>
                </div>
            </div>

            <div className="liked-by">
                <span><img src={profileImg} /></span>
                <span><img src={profileImg} /></span>
                <span><img src={profileImg} /></span>
                <p>Liked by <b>baba</b> and <b>2,333 others</b></p>
            </div>

            <div className="caption">
                <p><b>Hafiz</b> {title} {description} <span className="harsh-tag">#sportybet</span></p>
            </div>
            <div className="comments text-muted">View all 122 comments</div>
        </div>
  );
};

Product.propTypes = {
  product: PropTypes.instanceOf(Object).isRequired,
  buy: PropTypes.func.isRequired,
};

export default Product;
