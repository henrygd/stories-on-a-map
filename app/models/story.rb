class Story < ApplicationRecord
  belongs_to :user
  before_create :create_munged_title
  before_save :sanitize_content
  before_save :createPlaceholders

  mount_uploader :picture,    PictureUploader
  mount_uploader :background, BackgroundUploader

  validates :title,      presence: true, length: { maximum: 100 }
  validates :author,     presence: true, length: { maximum: 100 }
  validates :content,    presence: true, length: { maximum: 50000 }
  validates :coords,     presence: true
  validates :picture,    presence: true
  validates :background, presence: true
  validates :user_id,    presence: true
  validates :audio,      length: { maximum: 500 }
  validate  :image_size

  def to_param
    munged_title
  end

  private

  # blurred image placeholders
  def createPlaceholders
    def base64_img(parentImg, size, blur)
      img = MiniMagick::Tool::Convert.new do |convert|
        convert << "#{Rails.root}/public#{parentImg}"
        convert.strip
        convert.resize "#{size}x#{size}>"
        convert.quality "90"
        convert.blur "0x#{blur}"
        convert << "-" # stdout
      end
      Base64.strict_encode64(img)
    end
    self.placeholder_picture = base64_img(picture, 350, 15)
    self.placeholder_background = base64_img(background, 500, 20)
  end

    # converts title to url-friendly string - 'This Title' -> 'this-title-7wH' 
    def create_munged_title
      self.munged_title = "#{title.parameterize}-#{rand(36**3).to_s(36)}"
    end

    def sanitize_content
      self.content = ActionController::Base.helpers.sanitize content,
                       tags: %w(p i u strong b br h2 img blockquote),
                       attributes: %w(class file src)
    end

    # Validates the size of an uploaded image
    def image_size
      if picture.size > 1.megabytes
        errors.add(:picture, "should be less than 1MB")
      end
      if background.size > 2.megabytes
        errors.add(:background, "should be less than 2MB")
      end
    end

end
