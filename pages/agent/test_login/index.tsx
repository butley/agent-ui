import React from "react";

function Login() {
  return (
      <div className="flex justify-center items-center h-screen w-screen bg-primary">
        <div className="shadow-md">
          <div className="login">
            <div className="group-wrapper">
              <div className="group">
                <div className="overlap-group-wrapper">
                  <div className="overlap-group">
                    <p className="login-with-others">
                      <span className="text-wrapper">Login</span>
                      <span className="span"> with Others</span>
                    </p>
                    <img className="subtract" alt="Subtract" src="/img/subtract.svg" />
                  </div>
                </div>
                <div className="div">LOGIN</div>
                <p className="p">Provide your credentials or use Google</p>
                <div className="overlap-wrapper">
                  <div className="overlap">
                    <input
                        type="password"
                        placeholder="Password"
                        className="text-wrapper-2"
                    />
                    <img className="frame" alt="Frame" src="/img/lock_frame.svg" />
                  </div>
                </div>
                <div className="div-wrapper">
                  <div className="overlap">
                    <input
                        type="text"
                        placeholder="Username"
                        className="text-wrapper-2"
                    />
                    <img className="frame" alt="Frame" src="/img/user_frame.svg" />
                  </div>
                </div>
                <button className="flex group-2">
                  <div className="overlap-2 hover:bg-primary">
                    <div className="text-wrapper-3">Login Now</div>
                  </div>
                </button>
                <button className="group-3">
                  <div className="overlap-2">
                    <div className="text-wrapper-4">Create Account</div>
                  </div>
                </button>
                <button className="group-4">
                  <div className="group-5 hover:bg-primary">
                    <div className="group-6">
                      <p className="login-with-google">
                        <span className="text-wrapper-5">Login with </span>
                        <span className="text-wrapper-6">Google</span>
                      </p>
                      <img className="google" alt="Google" src="/img/google-1.png" />
                    </div>
                  </div>
                </button>
                <div className="element-robotic-wrapper">
                  <img
                    className="element-robotic"
                    alt="Element robotic"
                    src="/img/butley_big.png"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default Login;
