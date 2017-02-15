Rails.application.routes.draw do
	# For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
	scope '/api' do
		resources :stories, only: [:index, :show, :create]
		resources :users, only: [:show, :create]
		resources :bookmarks, only: [:index, :create]
		
		# authentication
		post :authenticate, to: 'authentication#authenticate'
		post :signup, to: 'users#create'

		# bookmarks destroy
		post '/bookmarks/delete', to: 'bookmarks#destroy'

		# stories destroy
		post '/stories/delete', to: 'stories#destroy'

		# contact form data
		post '/contact', to: 'contact_form#send_mail', as: 'contact_form'

		# password reset
		post '/reset-password',  to: 'password_resets#create'
		post '/update-password', to: 'password_resets#update'

		resources :account_activations, only: [:edit], as: 'api_account_activations'
	end

	# base url email shortcut links
	resources :account_activations, only: [:edit], as: 'account_activations'
	resources :password_resets,     only: [:edit]
end
