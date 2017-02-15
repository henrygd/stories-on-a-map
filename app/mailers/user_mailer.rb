class UserMailer < ApplicationMailer

  def account_activation(user)
    @user = user
    mail to: user.email, subject: "Account activation: Stories on a Map"
  end

  def password_reset(user)
    @user = user
    mail to: user.email, subject: "Password reset: Stories on a Map"
  end
end