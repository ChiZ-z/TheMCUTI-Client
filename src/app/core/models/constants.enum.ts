export enum Constants {
    //SEARCH PARAMS
    TRANSLATION = "TRANSLATION",
    TERMVALUE = "TERMVALUE",
    MODIFIER = "MODIFIER",
    REFERENCE = "REFERENCE",
    PROJECTNAME = "PROJECTNAME",
    TERM = "TERM",
    CONTRIBUTOR = "CONTRIBUTOR",

    //SORT STATES
    CREATIONDATE = "CREATIONDATE",
    MODIFIEDDATE = "MODIFIEDDATE",
    TERMNAME = "TERMNAME",
    PROGRESS =  "PROGRESS",
    LANGUAGENAME = "LANGUAGENAME",
    USERNAME = "USERNAME",
    USERFIRSTNAME = "USERFIRSTNAME",
    USERLASTNAME = "USERLASTNAME",
    GLOSSARYNAME = "GLOSSARYNAME",
    GROUPSAMOUNT = "GROUPSAMOUNT",
    TRANSLATIONSAMOUNT = "TRANSLATIONSAMOUNT",
    POPULARITY = "POPULARITY",
    GROUPNAME = "GROUPNAME",
    LANGCOUNT = "LANGCOUNT",

    //FILTER STATES
    DEFAULT = "DEFAULT",
    FUZZY = "FUZZY",
    NOTFUZZY = "NOTFUZZY",
    TRANSLATED = "TRANSLATED",
    UNTRANSLATED = "UNTRANSLATED",
    DEFAULTEDIT = "DEFAULTEDIT",
    MYGLOSSARIES = "MYGLOSSARIES",
    SUBSCRIPTIONS = "SUBSCRIPTIONS",

    //ROLES
    TRANSLATOR = "TRANSLATOR",
    AUTHOR = "AUTHOR",
    MODERATOR = "MODERATOR",

    //FLAGS
    DEFAULT_WAS_CHANGED = "DEFAULT_WAS_CHANGED",
    AUTOTRANSLATED = "AUTOTRANSLATED",

    //CONTACT TYPES
    PHONE = "PHONE",
    SKYPE = "SKYPE",
    VK = "VK",
    EMAIL = "EMAIL",
    INSTAGRAM = "INSTAGRAM",
    TWITTER = "TWITTER",
    FACEBOOK = "FACEBOOK",

    //CHART ITEMS
    SUMMARY = "SUMMARY",
    ALL = "ALL",
    TRANSLATE_BY_IMPORT = "TRANSLATE_BY_IMPORT",
    EDIT_BY_IMPORT = "EDIT_BY_IMPORT",
    EDIT = "EDIT",
    TRANSLATE = "TRANSLATE",
    AUTO_TRANSLATE = "AUTO_TRANSLATE",

    //PROJECT TYPES

    MYPROJECTS = "MYPROJECTS",
    SHARED = "SHARED",

    //LANG LEVEL TYPES
    HIGH = "HIGH",
    MEDIUM = "MEDIUM",
    LOW = "LOW",

    //NOTIFICATION CONSTANTS
    SUCCESS = "success",
    ERROR = "error",
    WARNING = "warning",
    ERROR_TITLE = "error.title",
    WARNING_TITLE = "warning.title",

    //SEARCH CONSTANTS
    PROJECTS = "PROJECTS",
    TERMS = "TERMS",
    TRANSLATIONS = "TRANSLATIONS",

    //HISTORY
    IMPORT_TERMS = "IMPORT_TERMS",
    IMPORT_TRANSLATIONS = "IMPORT_TRANSLATIONS",
    ADD_PROJECT = "ADD_PROJECT",
    DELETE_PROJECT = "DELETE_PROJECT",
    ADD_PROJECT_LANG = "ADD_PROJECT_LANG",
    DELETE_PROJECT_LANG = "DELETE_PROJECT_LANG",
    ADD_TERM = "ADD_TERM",
    DELETE_TERM = "DELETE_TERM",
    EDIT_TERM = "EDIT_TERM",
    ADD_CONTRIBUTOR = "ADD_CONTRIBUTOR",
    DELETE_CONTRIBUTOR = "DELETE_CONTRIBUTOR",
    FLUSH_PROJECT_LANG = "FLUSH_PROJECT_LANG",
    FLUSH_PROJECT = "FLUSH_PROJECT",

    //History periods
    WEEK = "WEEK",
    MONTH = "MONTH",
    PERIOD = "PERIOD",
    FULL_STATS = "FULL_STATS",

    //GLOSSARY CONSTANTS
    ADDED = "ADDED",
    PUBLIC = "PUBLIC",
    PRIVATE = "PRIVATE",
    MARKET = "MARKET",

    //GLOSSARY_ROLES
    GL_AUTHOR = "AUTHOR",
    GL_FOLLOWER = "FOLLOWER",
    GL_MODERATOR = "MODERATOR",
    GL_ANONYMOUS = "ANONYMOUS",

    //INTEGRATIONS TYPE
    GITHUB = "GITHUB",
    BITBUCKET = "BITBUCKET",
    GITLAB = "GITLAB",

    //INTEGRATION ACTIONS
    INTEGRATION_IMPORT_TERMS = "IMPORT_TRANSLATIONS",
    INTEGRATION_IMPORT_TRANSLATIONS = "IMPORT_TERMS",
    INTEGRATION_IMPORT_TERMS_AND_TRANSLATIONS = "IMPORT_TERMS_TRANSLATIONS",
    INTEGRATION_EXPORT_TERMS = "EXPORT_TRANSLATIONS",
    INTEGRATION_EXPORT_TRANSLATIONS = "EXPORT_TERMS",
    INTEGRATION_EXPORT_TERMS_AND_TRANSLATIONS = "EXPORT_TERMS_TRANSLATIONS",
}