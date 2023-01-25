const SYSTEM_FAILURE = "Something failed.";
const INVALID_USER = "No user registered with given Id";
const INVALID_PROVIDER = "No provider registered with given Id";
const INACTIVE_ACCOUNT =
  "Account is not active. Please get in touch with app admin.";
const DELETED_ACCOUNT = "Your email id is not registered, please sign up below";

// middleware auth
const MIDDLEWARE_AUTH_CONSTANTS = {
  ACCESS_DENIED: "Access denied. No authorization token provided",
  RESOURCE_FORBIDDEN: "You don't have access to the request resource.",
  INVALID_AUTH_TOKEN: "Invalid token",
};

// admins.js
const ADMIN_CONSTANTS = {
  INVALID_EMAIL: "Invalid username/password.",
  NOTIFICATION_SUCCESS: "Notificaiton submitted successfully",
};

// auth.js
const AUTH_CONSTANTS = {
  INVALID_USER: INVALID_USER,
  DELETED_ACCOUNT: DELETED_ACCOUNT,
  INVALID_CREDENTIALS: "Invalid email or password",
  INVALID_PASSWORD:
    "You have entered incorrect old password. Please try again with valid password.",
  INACTIVE_ACCOUNT: INACTIVE_ACCOUNT,
  CONTACT_ADMIN: "Your account is in blocked state.Please Contact Admin ",
  CHANGE_PASSWORD_REQUEST_SUCCESS:
    "Password recovery link has been sent to your registered email.",
  CHANGE_PASSWORD_REQUEST_EMAIL_FAILURE:
    "Email sending failed due to some application issue.",
  INVALID_EMAIL:
    "The email provided is not registered. Please sign up to continue.",
  INVALID_RECOVERY_LINK: "Password link expired or not valid.",
  PASSWORD_CHANGE_SUCCESS: "Password changed succesfully",
  INVALID_OTP: "Invalid OTP passed",
  INVALID_MOBILE: "No user found with given mobile number.",
  MOBILE_REQUIRED: '"mobile" is required',
  OTP_TOKEN_REQUIRED: '"otpToken" is required',
  SYSTEM_FAILURE: SYSTEM_FAILURE,
};

const CARD_CONSTANTS = {
  INVALID_USER: INVALID_USER,
  INVALID_CARD: "Card with given Id not found",
  SET_DEFAULT: "Card set as default",
  CARD_REQUIRED: "cardId is mandatory parameter",
  CARD_ADDING_FAILED: "Card addition failed.",
  CARD_DELETE_SUCCESS: "Card removed successfully",
};

// OTP.js
const OTP_CONSTANTS = {
  INVALID_USER: INVALID_USER,
  NO_USER_REGISTERED_ERROR: "No user registered with given mobile number",
  DUPLICATE_MOBILE_NUMBER: "Mobile number entered is already registered.",
  INVALID_MOBILE_NUMBER:
    "Invalid mobile number entered. Please provide valid US mobile number.",
  EMAIL_SENDING_FAILED: "Email sending failed due to some application issue",
  OTP_GENERATED_SUCCESSFULLY: "Verification code generated successfully",
  OTP_VERIFIED: "Verification code verified for new user",
  INVALID_OTP: "Invalid Code",
  OTP_MAX_LIMIT_ERROR: "Max attempts to verify code breached",
  OTP_EXPIRED: "Verification code expired",
  OTP_VERIFIED_NEW_USER: "Verification code verified for new user",
};

// settings.js
const SETTING_CONSTANTS = {
  INVALID_USER: INVALID_USER,
};

// users.js
const USER_CONSTANTS = {
  INACTIVE_ACCOUNT: INACTIVE_ACCOUNT,
  INVALID_USER: INVALID_USER,
  MOBILE_EMAIL_ALREADY_EXISTS: "Mobile and email are already registered",
  EMAIL_ALREADY_EXISTS: "Email already registered",
  MOBILE_ALREADY_EXISTS: "Mobile number already registered",
  USERNAME_ALREADY_EXISTS: "UserName already registered",
  ALL_CHECKS_VALID: "All check are valid. Proceed for OTP",
  INVALID_OTP: "Invalid OTP passed",
  OTP_MISSING: "No OTP passed. OTP is required for registration.",
  OTP_MISSING_UPDATE: "No OTP passed. OTP is required for update.",
  LOGGED_OUT: "Logged Out successfully",
  VERIFICATION_SUCCESS: "Continue for OTP.",
  DELETED_USER: "You have deleted successfully",
  INVALID_REFERRAL_CODE: "Invalid referral Code",
};

const PROVIDER_CONSTANTS = {
  INACTIVE_ACCOUNT: INACTIVE_ACCOUNT,
  INVALID_PROVIDER: INVALID_PROVIDER,
  EMAIL_ALREADY_EXISTS: "Email already registered",
  MOBILE_ALREADY_EXISTS: "Mobile number already registered",
  USERNAME_ALREADY_EXISTS: "UserName already registered",
  ALL_CHECKS_VALID: "All check are valid. Proceed for OTP",
  INVALID_OTP: "Invalid OTP passed",
  OTP_MISSING: "No OTP passed. OTP is required for registration.",
  UPDATE_STATUS: "Status updated successfully",
  UPDATE_STATUS_FAILURE: "Status is already updated",
  VERIFICATION_SUCCESS: "Continue for OTP.",
  ALREADY_ASSIGNED:
    "You can't access the available jobs as you already have an assigned job.",
  NOT_AVAILABLE:
    "You can't access the available jobs as your status is Offline.",
  BALANCE_FETCH_FAILED: "Unable to fetch the balance from server.",
  PAYOUT_FETCH_FAILED: "Unable to fetch the payout list from server.",
  STRIPE_NOT_INTEGRATED: "No account linked for payouts.",
};
//favorites constants
const FAVORITE_CONSTANTS = {
  INVALID_PROVIDER: INVALID_PROVIDER,
  NOT_FOUND: "Not Found",
  ALREADY_ADDED: "Already added in your favorite list",
};

const CATEGORY_CONSTANTS = {
  CATEGORY_ALREADY_EXISTS: "category with given name already exists",
  CATEGORY_NOT_FOUND: "category not found",
  CATEGORY_UPDATED: "Category updated successfully",
  CATEGORY_DELETED: "Category deleted successfully",
};
//subcategories
const SUBCATEGORY_CONSTANTS = {
  SUBCATEGORY_CREATED: "Subcategory created successfully",
  SUBCATEGORY_ALREADY_EXISTS: "Subcategory with given name already exists",
  SUBCATEGORY_NOT_FOUND: "Subcategory not found",
  SUBCATEGORY_UPDATED: "Subcategory updated successfully",
  SUBCATEGORY_DELETED: "Subcategory deleted successfully",
};
const IMAGE_CONSTANTS = {
  IMAGE_ALREADY_EXISTS: "Image with given name already exists",
  IMAGE_NOT_FOUND: "Image not found",
  IMAGE_UPDATED: "Image updated successfully",
  IMAGE_DELETED: "Image deleted successfully",
  IMAGE_UPLOADE: "Image uploaded successfully",
};

const VERSION_CONSTANT = {
  SUBMIT_SUCCESS: "Version details added successfully",
  NO_UPDATE: "You are on latest version",
  VERSION_MANDATORY: "Query parameter v is mandatory",
  APPTYPE_MANDATORY: "Query parameter appType is mandatory",
};

const CARNIVAL_CONSTANTS = {
  CARNIVAL_ALREADY_EXISTS: "Carnival with given name already exists",
  CARNIVAL_NOT_FOUND: "Carnival not found",
  CARNIVAL_UPDATED: "Carnival updated successfully",
  CARNIVAL_DELETED: "Carnival deleted successfully",
  CARNIVAL_ALREADY_MEMBER: "You are already member of this Carnival",
  CARNIVAL_NOT_MEMBER: "You are not member of this Carnival",
  CARNIVAL_DISJOIN_MEMBER: "Now you are not members of this Carnival",
  CHECK_IN: "You Check In Successfully",
  ALREADY_CHECK_IN: "You  Already Check In",
};
const CONTEST_CONSTANTS = {
  CONTEST_ALREADY_EXISTS: "Contest with given carnivalId  already exists",
  CONTEST_NOT_FOUND: "Contest not found",
  CONTEST_UPDATED: "Contest updated successfully",
  CONTEST_DELETED: "Contest deleted successfully",
};
const GROUP_CONSTANTS = {
  GROUP_ALREADY_EXISTS: "Group with given name already exists",
  GROUP_NOT_FOUND: "Group not found",
  GROUP_UPDATED: "Group updated successfully",
  GROUP_DELETED: "Group deleted successfully",
  GROUP_ALREADY_MEMBER: "You are already member of this Group",
  GROUP_NOT_MEMBER: "You are not member of this Group",
  GROUP_DISJOIN_MEMBER: "Now you are not members of this Group",
};
const PUBLICFEED_CONSTANTS = {
  PUBLICFEED_ALREADY_EXISTS: "Publicfeed  already exists",
  PUBLICFEED_NOT_FOUND: "Publicfeed not found",
  PUBLICFEED_UPDATED: "Publicfeed updated successfully",
  PUBLICFEED_DELETED: "Publicfeed deleted successfully",
  ALREADY_LIKED: " Already liked",
  NOT_LIKED: " Not liked",
  UNLIKED_PUBLIC_FEED: " You  unlike this PublicFeed",
  PUBLICFEEDCOMMENT_NOT_FOUND: "Publicfeed Comment Id not found",
};
const CARNIVAL_FEED_CONSTANTS = {
  CARNIVAL_FEED_ALREADY_EXISTS: "Carnivalfeed  already exists",
  CARNIVAL_FEED_NOT_FOUND: "Carnivalfeed not found",
  CARNIVAL_FEED_UPDATED: "Carnivalfeed updated successfully",
  CARNIVAL_FEED_DELETED: "Carnivalfeed deleted successfully",
  ALREADY_LIKED: " Already liked",
  NOT_LIKED: " Not liked",
  UNLIKED_CARNIVAL_FEED: " You  unlike this CarnivalFeed",
  CARNIVAL_FEED_COMMENT_NOT_FOUND: "Carnivalfeed Comments Id not found",
};

const BLOCK_USER_CONSTANTS = {
  USER_ALREADY_BLOCK: "You are already block this User",
  USER_ALREADY_UNBLOCK: "You are already unblock this User",
  USER_BLOCKED: "You have block this User",
  USER_UNBLOCKED: "You have unblock this User",
  CANNOT_BLOCK_UNBLOCK: "You cannot block or unblock yourself",
};
const REPORT_USER_CONSTANTS = {
  USER_REPORTED: "Post reported successfully",
  USER_UNREPORTED: "Post Unreported successfully",
  USER_ALREADY_REPORTED: "You already reported ",
  USER_ALREADY_UNREPORTED: "You already Unreported ",
  CANNOT_REPORT: "You cannot report yourself",
  NOT_FOUND: "Id not found",
};
const CHAT_CONSTANTS = {
  CHAT_DELETED: "Chat deleted successfully",
  NOT_FOUND: "Id not found",
};

const ROADKING_CONSTANTS = {
  ROADKING_ALREADY_EXISTS: "RoadKing  already exists",
  ROADKING_NOT_FOUND: "RoadKingId not found",
  ROADKING_UPDATED: "RoadKing updated successfully",
  ROADKING_DELETED: "RoadKing deleted successfully",
  ALREADY_PARTICIPATED: "You already Participated",
  CANNOT_PARTICIPATE: "You cannot Participate, Participation time is over ",
  CANNOT_VOTE: "You cannot Vote, Voting time is over ",
  ALREADY_VOTED: "You already voted",
  ALREADY_VOTED_FOR_ROADKINGQUEEN:
    "You can vote for only one Road King and one Road Queen for this contest.",
};

const ROADQUEEN_CONSTANTS = {
  ROADQUEEN_ALREADY_EXISTS: "RoadQueen  already exists",
  ROADQUEEN_NOT_FOUND: "RoadQueenId  not found",
  ROADQUEEN_UPDATED: "RoadQueen  updated successfully",
  ROADQUEEN_DELETED: "RoadQueen  deleted successfully",
  ALREADY_PARTICIPATED: "You already Participated",
  CANNOT_PARTICIPATE: "You cannot Participate, Participation time is over ",
  CANNOT_VOTE: "You cannot Vote, Voting time is over ",
  ALREADY_VOTED: "You already voted",
};

const REWARDITEM_CONSTANTS = {
  REWARDITEM_ALREADY_EXISTS:
    "Reward Item with given rewardItemId  already exists",
  REWARDITEM_NOT_FOUND: "Reward Item not found",
  REWARDITEM_UPDATED: "Reward Item updated successfully",
  REWARDITEM_DELETED: "Reward Item deleted successfully",
  USER_REWARDPOINT_LESS: "User have less Reward Point",
  REWARDITEMBUY_ID_NOT_FOUND: "RewardItemBuyId not found",
  REWARDITEMBUY_SENT: "Reward Item sent successfully",
  REWARDITEMBUY_DELIVERED: "Reward Item delivered successfully",
};

module.exports.SYSTEM_FAILURE = SYSTEM_FAILURE;
module.exports.MIDDLEWARE_AUTH_CONSTANTS = MIDDLEWARE_AUTH_CONSTANTS;
module.exports.AUTH_CONSTANTS = AUTH_CONSTANTS;
module.exports.ADMIN_CONSTANTS = ADMIN_CONSTANTS;
module.exports.CARD_CONSTANTS = CARD_CONSTANTS;
module.exports.OTP_CONSTANTS = OTP_CONSTANTS;
module.exports.SETTING_CONSTANTS = SETTING_CONSTANTS;
module.exports.USER_CONSTANTS = USER_CONSTANTS;
module.exports.PROVIDER_CONSTANTS = PROVIDER_CONSTANTS;
module.exports.VERSION_CONSTANT = VERSION_CONSTANT;
module.exports.FAVORITE_CONSTANTS = FAVORITE_CONSTANTS;
module.exports.CATEGORY_CONSTANTS = CATEGORY_CONSTANTS;
module.exports.SUBCATEGORY_CONSTANTS = SUBCATEGORY_CONSTANTS;
module.exports.IMAGE_CONSTANTS = IMAGE_CONSTANTS;
module.exports.CARNIVAL_CONSTANTS = CARNIVAL_CONSTANTS;
module.exports.PUBLICFEED_CONSTANTS = PUBLICFEED_CONSTANTS;
module.exports.CARNIVAL_FEED_CONSTANTS = CARNIVAL_FEED_CONSTANTS;
module.exports.BLOCK_USER_CONSTANTS = BLOCK_USER_CONSTANTS;
module.exports.REPORT_USER_CONSTANTS = REPORT_USER_CONSTANTS;
module.exports.CHAT_CONSTANTS = CHAT_CONSTANTS;
module.exports.GROUP_CONSTANTS = GROUP_CONSTANTS;
module.exports.ROADKING_CONSTANTS = ROADKING_CONSTANTS;
module.exports.ROADQUEEN_CONSTANTS = ROADQUEEN_CONSTANTS;
module.exports.CONTEST_CONSTANTS = CONTEST_CONSTANTS;
module.exports.REWARDITEM_CONSTANTS = REWARDITEM_CONSTANTS;
