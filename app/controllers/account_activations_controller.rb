class AccountActivationsController < ApplicationController
  skip_before_action :authenticate_request

  def edit
    user = User.find_by(email: params[:email])
    # byebug
    if user && !user.activated? && user.authenticated?(:activation, params[:id])
      user.activate
      auth_token = JsonWebToken.encode(username: user.username)
      render json: { msg: "Account activated. Thanks for joining!", auth_token: auth_token }
    else
      render json: { error: "Invalid activation link" }, status: :unprocessable_entity
    end
  end
  
end