class CreateStories < ActiveRecord::Migration
  def change
    create_table :stories do |t|
      t.integer :user_id
      t.string :coords
      t.string :title
      t.string :author
      t.text :content

      t.timestamps null: false
    end
  end
end
