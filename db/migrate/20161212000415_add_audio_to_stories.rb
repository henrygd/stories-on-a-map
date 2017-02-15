class AddAudioToStories < ActiveRecord::Migration[5.0]
  def change
    add_column :stories, :audio, :string
  end
end
