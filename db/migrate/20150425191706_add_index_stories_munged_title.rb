class AddIndexStoriesMungedTitle < ActiveRecord::Migration
  def change
    add_index :stories, :munged_title, unique: true
  end
end
