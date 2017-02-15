# Preview all emails at http://localhost:3000/rails/mailers/contact_mailer
class ContactMailerPreview < ActionMailer::Preview

  # Preview this email at http://localhost:3000/rails/mailers/contact_mailer/contact_form
  def contact_form
    name = 'Testy McGee'
    email = 'usermail@input.com'
    message = 'Hello, this is a contact form message!'
    ContactMailer.contact_form(name, email, message)
  end

end
