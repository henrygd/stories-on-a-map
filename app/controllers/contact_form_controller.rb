class ContactFormController < ApplicationController
	skip_before_action :authenticate_request

	def send_mail
		args = contact_params
		errors = []
		max_length = {
			:name      => 255,
			:email     => 255,
			:message   => 8000,
		}
		# check if needed params exist, return error if missing
		[:name, :email, :message].each do |key|
			if !args[key] || args[key] == ""
				errors.push "Missing #{key} parameter"
			end
			if args[key].length > max_length[key]
				errors.push "#{key.capitalize} is too long (max #{max_length[key]} characters)"
			end
		end
		if errors.any?
			return render json: {error: errors}, status: :unprocessable_entity
		end
		# send email
		ContactMailer.contact_form(args).deliver_now
		render json: {msg: 'Message sent. Thank you!'}
	end

end

private

	def contact_params
		params.permit(:name, :email, :message)
	end
