import React, { useEffect, useCallback, useState } from "react";
import { useHistory, Redirect } from "react-router-dom";
import { Container, Nav } from "react-bootstrap";
// import AddUser from "./AddProduct";
import Products from "./components/marketplace/Products";
import "./App.css";
import Wallet from "./components/Wallet";
import coverImg from "./assets/img/sliposhi.png";
import profileImg from "./assets/img/profile.jpg";
import { login, logout as destroy } from "./utils/auth";
import { balance as principalBalance } from "./utils/ledger"
import Cover from "./components/utils/Cover";
import { Notification } from "./components/utils/Notifications";
import {
    getUsers as findUser, getUserList,
    createUser, subscribeUser
  } from "./utils/user";

const App = function AppWrapper() {
    const isAuthenticated = window.auth.isAuthenticated;
    const principal = window.auth.principalText;

    const [balance, setBalance] = useState("0");

    const getBalance = useCallback(async () => {
        if (isAuthenticated) {
            setBalance(await principalBalance());
        }
    });

    useEffect(() => {
        getBalance();
    }, [getBalance]);

    // add new user
    const addUser = async (data) => {

        // check if user exist
        findUser({principal}).then((resp) => {
            if (!resp) {
                try {
                    setLoading(true);
                    data.internet_identity = {principal};
                    data.username = 'userABC';
                    data.email = 'email.email.com';
                    data.attachmentURL = {profileImg};
                    createUser(data).then((resp) => {
                      // getProducts();
                    });
                    toast(<NotificationSuccess text="User account created successfully." />);
                  } catch (error) {
                    console.log({ error });
                    toast(<NotificationError text="Failed create user account." />);
                  } finally {
                    setLoading(false);
                  }
            }
        });
      };

    return (
        <>
            <Notification />
            {isAuthenticated ? (

                <div>
                    <nav>
                        <Container>
                            <h2>sliposhi</h2>
                            <div className="search-bar">
                                <i className="bi bi-binoculars"></i>
                                <input type="search" placeholder="Search for bettors, slips, odds, exchanges"/>
                            </div>
                            <div className="create">
                                <Wallet
                                    principal={principal}
                                    balance={balance}
                                    symbol={"ICP"}
                                    isAuthenticated={isAuthenticated}
                                    destroy={destroy}
                                />
                                <div className="profile-photo">
                                    <img src={profileImg} />
                                </div>
                            </div>
                        </Container>
                    </nav>
                    <main>
                        <div className="container">
                            <div className="left">
                                <a className="profile">
                                    <div className="profile-photo">
                                        <img src={profileImg} />
                                    </div>
                                    <div className="handle">
                                        <h5>Moro Tijani</h5>
                                        <small className="text-muted">@takyi</small>
                                    </div>
                                </a>

                                <div className="sidebar">
                                    <a className="menu-item active">
                                        <span><i class="bi bi-houses" /> Home</span>
                                    </a>
                                    <a className="menu-item">
                                    <span><i class="bi bi-currency-bitcoin" /> VIP</span>
                                    </a>
                                    <a className="menu-item" id="notification">
                                        <span><i class="bi bi-bell"><small className="notification-count">9+</small></i> Notifications</span>
                                    </a>
                                    <a className="menu-item" id="messages-notification">
                                        <span><i class="bi bi-chat-right"><small className="notification-count">5</small></i> Messages</span>
                                    </a>
                                    <a className="menu-item">
                                        <span><i class="bi bi-shop"></i> Marketplace</span>
                                    </a>
                                    <a className="menu-item">
                                        <span><i class="bi bi-bookmark"></i> Bookmarks</span>
                                    </a>
                                    <a className="menu-item">
                                        <span><i class="bi bi-sign-turn-slight-left"></i> Logout</span>
                                    </a>
                                </div>
                                <label htmlFor="create-post" className="btn btn-primary">Create Post</label>
                            </div>

                            <div className="middle">
                                <ul className="nav nav-tabs nav-tabs-white justify-content-center border-0" role="tablist">
                                    <li className="nav-item"> <a className="nav-link active" href="#tab-1" aria-selected="true"> For you </a> </li>
                                    <li className="nav-item"> <a className="nav-link"href="#tab-6"> VIP </a> </li>
                                    <li className="nav-item"> <a className="nav-link"href="#tab-3"> Trending </a> </li>
                                    <li className="nav-item"> <a className="nav-link"href="#tab-5"> Sports </a> </li>
                                </ul>

                                <div className="feeds">
                                    <Products />
                                </div>
                            </div>
                
                            <div className="right">
                                {/* <AddUser save={addUser} /> */}
                                <div className="friend-requests">
                                    <h4>Requests</h4>
                                    <div className="request">
                                        <div className="info">
                                            <div class="profile-photo">
                                                <img src={profileImg} />
                                            </div>
                                            <div>
                                                <h5>Raymond Tata</h5>
                                                <p className="text-muted">
                                                    8 vip subscribers, 12 followers
                                                </p>
                                            </div>
                                        </div>
                                        <div className="action">
                                            <button className="btn btn-primary">Subscribe</button>
                                            <button className="btn btn-light">Follow</button>
                                        </div>
                                    </div>
                                    <div className="request">
                                        <div className="info">
                                            <div class="profile-photo">
                                                <img src={profileImg} />
                                            </div>
                                            <div>
                                                <h5>Zaidan Wutrima</h5>
                                                <p className="text-muted">
                                                    8 vip subscribers, 12 followers
                                                </p>
                                            </div>
                                        </div>
                                        <div className="action">
                                            <button className="btn btn-primary">Subscribe</button>
                                            <button className="btn btn-light">Follow</button>
                                        </div>
                                    </div>
                                    <div className="request">
                                        <div className="info">
                                            <div class="profile-photo">
                                                <img src={profileImg} />
                                            </div>
                                            <div>
                                                <h5>Kojo Boateng</h5>
                                                <p className="text-muted">
                                                    8 vip subscribers, 12 followers
                                                </p>
                                            </div>
                                        </div>
                                        <div className="action">
                                            <button className="btn btn-primary">Subscribe</button>
                                            <button className="btn btn-light">Follow</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </main>
                </div>
            ) : (
                <Cover name="Sliposhi" login={login} coverImg={coverImg} />
            )}
        </>
    );
};

export default App;

