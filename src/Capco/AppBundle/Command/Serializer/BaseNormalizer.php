<?php

namespace Capco\AppBundle\Command\Serializer;

use Capco\AppBundle\Enum\ForOrAgainstType;
use Capco\AppBundle\Enum\ProposalPublicationStatus;
use Symfony\Contracts\Translation\TranslatorInterface;

abstract class BaseNormalizer
{
    final public const IS_EXPORT_NORMALIZER = 'is_export_normalizer';
    final public const IS_FULL_EXPORT = 'is_full_export';
    protected const EXPORT_PARTICIPANT_USER_ID = 'export_participant_user_id';
    protected const EXPORT_CONTRIBUTION_TYPE_REPLY = 'export_contribution_type_questionnaire_reply';
    protected const EXPORT_CONTRIBUTION_TYPE_REPLY_ANONYMOUS = 'export_contribution_type_questionnaire_reply_anonymous';
    protected const EXPORT_PARTICIPANT_USERNAME = 'export_participant_username';
    protected const EXPORT_PARTICIPANT_USER_EMAIL = 'export_participant_user_email';
    protected const EXPORT_PARTICIPANT_PHONE = 'export_participant_phone';
    protected const EXPORT_PARTICIPANT_TYPE = 'export_participant_type';
    protected const EXPORT_PARTICIPANT_FIRSTNAME = 'export_participant_firstname';
    protected const EXPORT_PARTICIPANT_LASTNAME = 'export_participant_lastname';
    protected const EXPORT_PARTICIPANT_DATE_OF_BIRTH = 'export_participant_date_of_birth';
    protected const EXPORT_PARTICIPANT_POSTAL_ADDRESS = 'export_participant_postal_address';
    protected const EXPORT_PARTICIPANT_ZIP_CODE = 'export_participant_zip_code';
    protected const EXPORT_PARTICIPANT_CITY = 'export_participant_city';
    protected const EXPORT_PARTICIPANT_PROFILE_URL = 'export_participant_profile_url';
    protected const EXPORT_PARTICIPANT_IDENTIFICATION_CODE = 'export_participant_identification_code';
    protected const EXPORT_PARTICIPANT_USER_CREATED_AT = 'export_participant_user_created_at';
    protected const EXPORT_PARTICIPANT_USER_UPDATED_AT = 'export_participant_user_updated_at';
    protected const EXPORT_PARTICIPANT_USER_LAST_LOGIN = 'export_participant_user_last_login';
    protected const EXPORT_PARTICIPANT_USER_ROLES_TEXT = 'export_participant_user_roles_text';
    protected const EXPORT_PARTICIPANT_USER_ENABLED = 'export_participant_user_enabled';
    protected const EXPORT_PARTICIPANT_USER_IS_EMAIL_CONFIRMED = 'export_participant_user_is_email_confirmed';
    protected const EXPORT_PARTICIPANT_USER_LOCKED = 'export_participant_user_locked';
    protected const EXPORT_PARTICIPANT_USER_IS_PHONE_CONFIRMED = 'export_participant_user_is_phone_confirmed';
    protected const EXPORT_PARTICIPANT_CONSENT_INTERNAL_COMMUNICATION = 'export_participant_consent_internal_communication';
    protected const EXPORT_PARTICIPANT_CONSENT_EXTERNAL_COMMUNICATION = 'export_participant_consent_external_communication';
    protected const EXPORT_PARTICIPANT_GENDER = 'export_participant_gender';
    protected const EXPORT_PARTICIPANT_WEBSITE_URL = 'export_participant_website_url';
    protected const EXPORT_PARTICIPANT_BIOGRAPHY = 'export_participant_biography';
    protected const EXPORT_PARTICIPANT_IS_FRANCE_CONNECT_ASSOCIATED = 'export_participant_is_france_connect_associated';
    protected const EXPORT_PARTICIPANT_CONFIRMED_ACCOUNT_AT = 'export_participant_confirmed_account_at';
    protected const EXPORT_PARTICIPANT_USER_GROUPS = 'export_participant_user_groups';
    protected const EXPORT_PARTICIPANT_DELETED_ACCOUNT_AT = 'export_participant_deleted_account_at';
    protected const EXPORT_PARTICIPANT_FACEBOOK_ID = 'export_participant_facebook_id';
    protected const EXPORT_PROPOSAL_ID = 'export_proposal_id';
    protected const EXPORT_PROPOSAL_CREATED_AT = 'export_proposal_created_at';
    protected const EXPORT_PROPOSAL_PUBLISHED_AT = 'export_proposal_published_at';
    protected const EXPORT_PROPOSAL_REFERENCE = 'export_proposal_reference';
    protected const EXPORT_PROPOSAL_TITLE = 'export_proposal_title';
    protected const EXPORT_PROPOSAL_SUMMARY = 'export_proposal_summary';
    protected const EXPORT_PROPOSAL_DESCRIPTION = 'export_proposal_description';
    protected const EXPORT_PROPOSAL_AUTHOR_ID = 'export_proposal_author_id';
    protected const EXPORT_PROPOSAL_VOTES_TOTAL_COUNT = 'export_proposal_votes_total_count';
    protected const EXPORT_PROPOSAL_VOTES_DIGITAL_COUNT = 'export_proposal_votes_digital_count';
    protected const EXPORT_PROPOSAL_VOTES_TOTAL_PAPER_COUNT = 'export_proposal_votes_paper_count';
    protected const EXPORT_PROPOSAL_VOTES_TOTAL_POINTS_COUNT = 'export_proposal_votes_total_points_count';
    protected const EXPORT_PROPOSAL_VOTES_DIGITAL_POINTS_COUNT = 'export_proposal_votes_digital_points_count';
    protected const EXPORT_PROPOSAL_VOTES_PAPER_POINTS_COUNT = 'export_proposal_votes_paper_points_count';
    protected const EXPORT_PROPOSAL_CATEGORY_NAME = 'export_proposal_category_name';
    protected const EXPORT_PROPOSAL_THEME_TITLE = 'export_proposal_theme_title';
    protected const EXPORT_PROPOSAL_FORMATTED_ADDRESS = 'export_proposal_formatted_address';
    protected const EXPORT_PROPOSAL_ADDRESS_LAT = 'export_proposal_address_lat';
    protected const EXPORT_PROPOSAL_ADDRESS_LNG = 'export_proposal_address_lng';
    protected const EXPORT_PROPOSAL_DISTRICT_NAME = 'export_proposal_district_name';
    protected const EXPORT_PROPOSAL_ESTIMATION = 'export_proposal_estimation';
    protected const EXPORT_PROPOSAL_ILLUSTRATION = 'export_proposal_illustration';
    protected const EXPORT_PROPOSAL_LINK = 'export_proposal_link';
    protected const EXPORT_PROPOSAL_STATUS_NAME = 'export_proposal_status_name';
    protected const EXPORT_PROPOSAL_UPDATED_AT = 'export_proposal_updated_at';
    protected const EXPORT_PROPOSAL_PUBLICATION_STATUS = 'export_proposal_publication_status';
    protected const EXPORT_PROPOSAL_UNDRAFT_AT = 'export_proposal_undraft_at';
    protected const EXPORT_PROPOSAL_TRASHED_AT = 'export_proposal_trashed_at';
    protected const EXPORT_PROPOSAL_TRASHED_REASON = 'export_proposal_trashed_reason';
    protected const EXPORT_PROPOSAL_AUTHOR_USERNAME = 'export_proposal_author_username';
    protected const EXPORT_PROPOSAL_AUTHOR_IS_EMAIL_CONFIRMED = 'export_proposal_author_is_email_confirmed';
    protected const EXPORT_PROPOSAL_AUTHOR_EMAIL = 'export_proposal_author_email';
    protected const EXPORT_PROPOSAL_AUTHOR_USER_TYPE_ID = 'export_proposal_author_user_type_id';
    protected const EXPORT_PROPOSAL_AUTHOR_USER_TYPE_NAME = 'export_proposal_author_user_type_name';
    protected const EXPORT_PROPOSAL_OFFICIAL_RESPONSE = 'export_proposal_official_response';
    protected const EXPORT_PROPOSAL_VOTES_ID = 'export_proposal_votes_id';
    protected const EXPORT_PROPOSAL_VOTES_RANKING = 'export_proposal_votes_ranking';
    protected const EXPORT_PROPOSAL_VOTES_CREATED_AT = 'export_proposal_votes_created_at';
    protected const EXPORT_PROPOSAL_VOTES_PUBLISHED_AT = 'export_proposal_votes_published_at';
    protected const EXPORT_PROPOSAL_VOTES_PUBLISHED = 'export_proposal_votes_published';
    protected const EXPORT_PROPOSAL_VOTES_ACCOUNTED = 'export_proposal_votes_accounted';
    protected const EXPORT_PROPOSAL_VOTES_ANONYMOUS = 'export_proposal_votes_anonymous';
    protected const EXPORT_PROPOSAL_VOTES_AUTHOR_ID = 'export_proposal_votes_author_id';
    protected const EXPORT_PROPOSAL_VOTES_AUTHOR_USERNAME = 'export_proposal_votes_author_username';
    protected const EXPORT_PROPOSAL_VOTES_AUTHOR_IS_EMAIL_CONFIRMED = 'export_proposal_votes_author_is_email_confirmed';
    protected const EXPORT_PROPOSAL_VOTES_AUTHOR_IS_PHONE_CONFIRMED = 'export_proposal_votes_author_is_phone_confirmed';
    protected const EXPORT_PROPOSAL_VOTES_AUTHOR_USER_TYPE_ID = 'export_proposal_votes_author_user_type_id';
    protected const EXPORT_PROPOSAL_VOTES_AUTHOR_USER_TYPE_NAME = 'export_proposal_votes_author_user_type_name';
    protected const EXPORT_PROPOSAL_COMMENTS_ID = 'export_proposal_comments_id';
    protected const EXPORT_PROPOSAL_COMMENTS_BODY = 'export_proposal_comments_body';
    protected const EXPORT_PROPOSAL_COMMENTS_CREATED_AT = 'export_proposal_comments_created_at';
    protected const EXPORT_PROPOSAL_COMMENTS_PUBLISHED_AT = 'export_proposal_comments_published_at';
    protected const EXPORT_PROPOSAL_COMMENTS_UPDATED_AT = 'export_proposal_comments_updated_at';
    protected const EXPORT_PROPOSAL_COMMENTS_AUTHOR_ID = 'export_proposal_comments_author_id';
    protected const EXPORT_PROPOSAL_COMMENTS_AUTHOR_USERNAME = 'export_proposal_comments_author_username';
    protected const EXPORT_PROPOSAL_COMMENTS_AUTHOR_IS_EMAIL_CONFIRMED = 'export_proposal_comments_author_is_email_confirmed';
    protected const EXPORT_PROPOSAL_COMMENTS_AUTHOR_USER_TYPE_ID = 'export_proposal_comments_author_user_type_id';
    protected const EXPORT_PROPOSAL_COMMENTS_AUTHOR_USER_TYPE_NAME = 'export_proposal_comments_author_user_type_name';
    protected const EXPORT_PROPOSAL_COMMENTS_AUTHOR_EMAIL = 'export_proposal_comments_author_email';
    protected const EXPORT_PROPOSAL_COMMENTS_PINNED = 'export_proposal_comments_pinned';
    protected const EXPORT_PROPOSAL_COMMENTS_PUBLICATION_STATUS = 'export_proposal_comments_publication_status';
    protected const EXPORT_PROPOSAL_COMMENTS_VOTE_ID = 'export_proposal_comments_vote_id';
    protected const EXPORT_PROPOSAL_COMMENTS_VOTE_CREATED_AT = 'export_proposal_comments_vote_created_at';
    protected const EXPORT_PROPOSAL_COMMENTS_VOTE_PUBLISHED_AT = 'export_proposal_comments_vote_published_at';
    protected const EXPORT_PROPOSAL_COMMENTS_VOTE_AUTHOR_ID = 'export_proposal_comments_vote_author_id';
    protected const EXPORT_PROPOSAL_COMMENTS_VOTE_AUTHOR_USERNAME = 'export_proposal_comments_vote_author_username';
    protected const EXPORT_PROPOSAL_COMMENTS_VOTE_AUTHOR_IS_EMAIL_CONFIRMED = 'export_proposal_comments_vote_author_is_email_confirmed';
    protected const EXPORT_PROPOSAL_COMMENTS_VOTE_AUTHOR_USER_TYPE_ID = 'export_proposal_comments_vote_author_user_type_id';
    protected const EXPORT_PROPOSAL_COMMENTS_VOTE_AUTHOR_USER_TYPE_NAME = 'export_proposal_comments_vote_author_user_type_name';
    protected const EXPORT_PROPOSAL_NEWS_ID = 'export_proposal_news_id';
    protected const EXPORT_PROPOSAL_NEWS_TITLE = 'export_proposal_news_title';
    protected const EXPORT_PROPOSAL_NEWS_THEMES = 'export_proposal_news_themes';
    protected const EXPORT_PROPOSAL_NEWS_LINKED_PROJECTS = 'export_proposal_news_linked_projects';
    protected const EXPORT_PROPOSAL_NEWS_LINKED_PROPOSAL = 'export_proposal_news_linked_proposal';
    protected const EXPORT_PROPOSAL_NEWS_CREATED_AT = 'export_proposal_news_created_at';
    protected const EXPORT_PROPOSAL_NEWS_UPDATED_AT = 'export_proposal_news_updated_at';
    protected const EXPORT_PROPOSAL_NEWS_PUBLISHED_AT = 'export_proposal_news_published_at';
    protected const EXPORT_PROPOSAL_NEWS_PUBLICATION_STATUS = 'export_proposal_news_publication_status';
    protected const EXPORT_PROPOSAL_NEWS_COMMENTABLE = 'export_proposal_news_commentable';
    protected const EXPORT_PROPOSAL_NEWS_DISPLAYED_ON_BLOG = 'export_proposal_news_displayed_on_blog';
    protected const EXPORT_PROPOSAL_NEWS_AUTHORS_ID = 'export_proposal_news_authors_id';
    protected const EXPORT_PROPOSAL_NEWS_AUTHORS_USERNAME = 'export_proposal_news_authors_username';
    protected const EXPORT_PROPOSAL_NEWS_AUTHORS_IS_EMAIL_CONFIRMED = 'export_proposal_news_authors_is_email_confirmed';
    protected const EXPORT_PROPOSAL_NEWS_AUTHORS_USER_TYPE_ID = 'export_proposal_news_authors_user_type_id';
    protected const EXPORT_PROPOSAL_NEWS_AUTHORS_USER_TYPE_NAME = 'export_proposal_news_authors_user_type_name';
    protected const EXPORT_PROPOSAL_NEWS_COMMENTS_ID = 'export_proposal_news_comments_id';
    protected const EXPORT_PROPOSAL_NEWS_COMMENTS_BODY = 'export_proposal_news_comments_body';
    protected const EXPORT_PROPOSAL_NEWS_COMMENTS_PARENT = 'export_proposal_news_comments_parent';
    protected const EXPORT_PROPOSAL_NEWS_COMMENTS_CREATED_AT = 'export_proposal_news_comments_created_at';
    protected const EXPORT_PROPOSAL_NEWS_COMMENTS_PUBLISHED_AT = 'export_proposal_news_comments_published_at';
    protected const EXPORT_PROPOSAL_NEWS_COMMENTS_UPDATED_AT = 'export_proposal_news_comments_updated_at';
    protected const EXPORT_PROPOSAL_NEWS_COMMENTS_AUTHOR_ID = 'export_proposal_news_comments_author_id';
    protected const EXPORT_PROPOSAL_NEWS_COMMENTS_AUTHOR_USERNAME = 'export_proposal_news_comments_author_username';
    protected const EXPORT_PROPOSAL_NEWS_COMMENTS_AUTHOR_IS_EMAIL_CONFIRMED = 'export_proposal_news_comments_author_is_email_confirmed';
    protected const EXPORT_PROPOSAL_NEWS_COMMENTS_AUTHOR_USER_TYPE_ID = 'export_proposal_news_comments_author_user_type_id';
    protected const EXPORT_PROPOSAL_NEWS_COMMENTS_AUTHOR_USER_TYPE_NAME = 'export_proposal_news_comments_author_user_type_name';
    protected const EXPORT_PROPOSAL_NEWS_COMMENTS_AUTHOR_EMAIL = 'export_proposal_news_comments_author_email';
    protected const EXPORT_PROPOSAL_NEWS_COMMENTS_PINNED = 'export_proposal_news_comments_pinned';
    protected const EXPORT_PROPOSAL_NEWS_COMMENTS_PUBLICATION_STATUS = 'export_proposal_news_comments_publication_status';
    protected const EXPORT_PROPOSAL_NEWS_COMMENTS_VOTE_ID = 'export_proposal_news_comments_vote_id';
    protected const EXPORT_PROPOSAL_NEWS_COMMENTS_VOTE_CREATED_AT = 'export_proposal_news_comments_vote_created_at';
    protected const EXPORT_PROPOSAL_NEWS_COMMENTS_VOTE_PUBLISHED_AT = 'export_proposal_news_comments_vote_published_at';
    protected const EXPORT_PROPOSAL_NEWS_COMMENTS_VOTE_AUTHOR_ID = 'export_proposal_news_comments_vote_author_id';
    protected const EXPORT_PROPOSAL_NEWS_COMMENTS_VOTE_AUTHOR_USERNAME = 'export_proposal_news_comments_vote_author_username';
    protected const EXPORT_PROPOSAL_NEWS_COMMENTS_VOTE_AUTHOR_IS_EMAIL_CONFIRMED = 'export_proposal_news_comments_vote_author_is_email_confirmed';
    protected const EXPORT_PROPOSAL_NEWS_COMMENTS_VOTE_AUTHOR_USER_TYPE_ID = 'export_proposal_news_comments_vote_author_user_type_id';
    protected const EXPORT_PROPOSAL_NEWS_COMMENTS_VOTE_AUTHOR_USER_TYPE_NAME = 'export_proposal_news_comments_vote_author_user_type_name';
    protected const EXPORT_PROPOSAL_NEWS_COMMENTS_REPORTINGS_ID = 'export_proposal_news_comments_reportings_id';
    protected const EXPORT_PROPOSAL_NEWS_COMMENTS_REPORTINGS_CREATED_AT = 'export_proposal_news_comments_reportings_created_at';
    protected const EXPORT_PROPOSAL_NEWS_COMMENTS_REPORTINGS_AUTHOR_ID = 'export_proposal_news_comments_reportings_author_id';
    protected const EXPORT_PROPOSAL_NEWS_COMMENTS_REPORTINGS_AUTHOR_USERNAME = 'export_proposal_news_comments_reportings_author_username';
    protected const EXPORT_PROPOSAL_NEWS_COMMENTS_REPORTINGS_AUTHOR_IS_EMAIL_CONFIRMED = 'export_proposal_news_comments_reportings_author_is_email_confirmed';
    protected const EXPORT_PROPOSAL_NEWS_COMMENTS_REPORTINGS_AUTHOR_USER_TYPE_ID = 'export_proposal_news_comments_reportings_author_user_type_id';
    protected const EXPORT_PROPOSAL_NEWS_COMMENTS_REPORTINGS_AUTHOR_USER_TYPE_NAME = 'export_proposal_news_comments_reportings_author_user_type_name';
    protected const EXPORT_PROPOSAL_REPORTINGS_ID = 'export_proposal_reportings_id';
    protected const EXPORT_PROPOSAL_REPORTINGS_BODY = 'export_proposal_reportings_body';
    protected const EXPORT_PROPOSAL_REPORTINGS_CREATED_AT = 'export_proposal_reportings_created_at';
    protected const EXPORT_PROPOSAL_REPORTINGS_AUTHOR_ID = 'export_proposal_reportings_author_id';
    protected const EXPORT_PROPOSAL_REPORTINGS_AUTHOR_USERNAME = 'export_proposal_reportings_author_username';
    protected const EXPORT_PROPOSAL_REPORTINGS_AUTHOR_IS_EMAIL_CONFIRMED = 'export_proposal_reportings_author_is_email_confirmed';
    protected const EXPORT_PROPOSAL_REPORTINGS_AUTHOR_USER_TYPE_ID = 'export_proposal_reportings_author_user_type_id';
    protected const EXPORT_PROPOSAL_REPORTINGS_AUTHOR_USER_TYPE_NAME = 'export_proposal_reportings_author_user_type_name';
    protected const EXPORT_PARTICIPANT_VOTES_TOTAL_COUNT_PER_STEP = 'user_votes_total_count_per_step';
    protected const EXPORT_PARTICIPANT_PROPOSAL_COUNT_PER_STEP = 'user_proposal_count_per_step';
    protected const EXPORT_PARTICIPANT_VOTED_PROPOSAL_IDS = 'user_voted_proposal_ids';
    protected const EXPORT_CONTRIBUTION_TYPE = 'export_contribution_type';
    protected const EXPORT_CONTRIBUTION_AUTHOR_ID = 'export_contribution_author_id';
    protected const EXPORT_CONTRIBUTION_AUTHOR_TYPE_NAME = 'export_contribution_author_type_name';
    protected const EXPORT_CONTRIBUTION_CONSULTATION_TITLE = 'export_contribution_consultation_title';
    protected const EXPORT_CONTRIBUTION_SECTION_TITLE = 'export_contribution_section_title';
    protected const EXPORT_CONTRIBUTION_TITLE = 'export_contribution_title';
    protected const EXPORT_CONTRIBUTION_BODY_TEXT = 'export_contribution_body_text';
    protected const EXPORT_CONTRIBUTIONS_CREATED_AT = 'export_contributions_created_at';
    protected const EXPORT_CONTRIBUTIONS_UPDATED_AT = 'export_contributions_updated_at';
    protected const EXPORT_CONTRIBUTION_URL = 'export_contribution_url';
    protected const EXPORT_CONTRIBUTION_TRASHED = 'export_contribution_trashed';
    protected const EXPORT_CONTRIBUTION_TRASHED_STATUS = 'export_contribution_trashed_status';
    protected const EXPORT_CONTRIBUTION_TRASHED_AT = 'export_contribution_trashed_at';
    protected const EXPORT_CONTRIBUTION_TRASHED_REASON = 'export_contribution_trashed_reason';
    protected const EXPORT_CONTRIBUTION_VOTES_COUNT = 'export_contribution_votes_count';
    protected const EXPORT_CONTRIBUTION_VOTES_COUNT_OK = 'export_contribution_votes_count_ok';
    protected const EXPORT_CONTRIBUTION_VOTES_COUNT_MITIGE = 'export_contribution_votes_count_mitige';
    protected const EXPORT_CONTRIBUTION_VOTES_COUNT_NOK = 'export_contribution_votes_count_nok';
    protected const EXPORT_CONTRIBUTION_ARGUMENTS_COUNT = 'export_contribution_arguments_count';
    protected const EXPORT_CONTRIBUTION_ARGUMENTS_COUNT_FOR = 'export_contribution_arguments_count_for';
    protected const EXPORT_CONTRIBUTION_ARGUMENTS_COUNT_AGAINST = 'export_contribution_arguments_count_against';
    protected const EXPORT_CONTRIBUTION_SOURCES_COUNT = 'export_contribution_sources_count';
    protected const EXPORT_CONTRIBUTION_VERSIONS_COUNT = 'export_contribution_versions_count';
    protected const EXPORT_CONTRIBUTION_CONTEXT_ELEMENT_TITLE = 'export_contribution_context_element_title';
    protected const EXPORT_CONTRIBUTION_CONTEXT_ELEMENT_BODY_TEXT = 'export_contribution_context_element_body_text';
    protected const EXPORT_CONTRIBUTION_VOTES_ID = 'export_contribution_votes_id';
    protected const EXPORT_CONTRIBUTION_VOTES_RELATED_ID = 'export_contribution_votes_related_id';
    protected const EXPORT_CONTRIBUTION_VOTES_AUTHOR_ID = 'export_contribution_votes_author_id';
    protected const EXPORT_CONTRIBUTION_VOTES_VALUE = 'export_contribution_votes_value';
    protected const EXPORT_CONTRIBUTION_VOTES_CREATED_AT = 'export_contribution_votes_created_at';
    protected const EXPORT_CONTRIBUTION_ARGUMENTS_RELATED_ID = 'export_contribution_arguments_related_id';
    protected const EXPORT_CONTRIBUTION_ARGUMENTS_RELATED_KIND = 'export_contribution_arguments_related_kind';
    protected const EXPORT_CONTRIBUTION_ARGUMENTS_ID = 'export_contribution_arguments_id';
    protected const EXPORT_CONTRIBUTION_ARGUMENTS_AUTHOR_ID = 'export_contribution_arguments_author_id';
    protected const EXPORT_CONTRIBUTION_ARGUMENTS_TYPE = 'export_contribution_arguments_type';
    protected const EXPORT_CONTRIBUTION_ARGUMENTS_BODY = 'export_contribution_arguments_body';
    protected const EXPORT_CONTRIBUTION_ARGUMENTS_CREATED_AT = 'export_contribution_arguments_created_at';
    protected const EXPORT_CONTRIBUTION_ARGUMENTS_UPDATED_AT = 'export_contribution_arguments_updated_at';
    protected const EXPORT_CONTRIBUTION_ARGUMENTS_URL = 'export_contribution_arguments_url';
    protected const EXPORT_CONTRIBUTION_ARGUMENTS_PUBLISHED = 'export_contribution_arguments_published';
    protected const EXPORT_CONTRIBUTION_ARGUMENTS_TRASHED = 'export_contribution_arguments_trashed';
    protected const EXPORT_CONTRIBUTION_ARGUMENTS_TRASHED_STATUS = 'export_contribution_arguments_trashed_status';
    protected const EXPORT_CONTRIBUTION_ARGUMENTS_TRASHED_AT = 'export_contribution_arguments_trashed_at';
    protected const EXPORT_CONTRIBUTION_ARGUMENTS_TRASHED_REASON = 'export_contribution_arguments_trashed_reason';
    protected const EXPORT_CONTRIBUTION_ARGUMENTS_VOTES_COUNT = 'export_contribution_arguments_votes_count';
    protected const EXPORT_CONTRIBUTION_REPORTINGS_RELATED_ID = 'export_contribution_reportings_related_id';
    protected const EXPORT_CONTRIBUTION_REPORTINGS_RELATED_KIND = 'export_contribution_reportings_related_kind';
    protected const EXPORT_CONTRIBUTION_REPORTINGS_ID = 'export_contribution_reportings_id';
    protected const EXPORT_CONTRIBUTION_REPORTINGS_AUTHOR_ID = 'export_contribution_reportings_author_id';
    protected const EXPORT_CONTRIBUTION_REPORTINGS_TYPE = 'export_contribution_reportings_type';
    protected const EXPORT_CONTRIBUTION_REPORTINGS_BODY = 'export_contribution_reportings_body';
    protected const EXPORT_CONTRIBUTION_REPORTINGS_CREATED_AT = 'export_contribution_reportings_created_at';
    protected const EXPORT_CONTRIBUTION_SOURCES_ID = 'export_contribution_sources_id';
    protected const EXPORT_CONTRIBUTION_SOURCES_RELATED_ID = 'export_contribution_sources_related_id';
    protected const EXPORT_CONTRIBUTION_SOURCES_RELATED_KIND = 'export_contribution_sources_related_kind';
    protected const EXPORT_CONTRIBUTION_SOURCES_AUTHOR_ID = 'export_contribution_sources_author_id';
    protected const EXPORT_CONTRIBUTION_SOURCES_TRASHED = 'export_contribution_sources_trashed';
    protected const EXPORT_CONTRIBUTION_SOURCES_TRASHED_STATUS = 'export_contribution_sources_trashed_status';
    protected const EXPORT_CONTRIBUTION_SOURCES_TRASHED_AT = 'export_contribution_sources_trashed_at';
    protected const EXPORT_CONTRIBUTION_SOURCES_TRASHEDREASON = 'export_contribution_sources_trashed_reason';
    protected const EXPORT_CONTRIBUTION_SOURCES_BODY = 'export_contribution_sources_body';
    protected const EXPORT_CONTRIBUTION_SOURCES_CREATED_AT = 'export_contribution_sources_created_at';
    protected const EXPORT_CONTRIBUTION_SOURCES_UPDATED_AT = 'export_contribution_sources_updated_at';
    protected const EXPORT_CONTRIBUTION_SOURCES_PUBLISHED = 'export_contribution_sources_published';
    protected const EXPORT_CONTRIBUTION_SOURCES_VOTES_COUNT = 'export_contribution_sources_votes_count';
    protected const EXPORT_CONTRIBUTION_VERSIONS_ID = 'export_contribution_versions_id';
    protected const EXPORT_CONTRIBUTION_VERSIONS_AUTHOR_ID = 'export_contribution_versions_author_id';
    protected const EXPORT_CONTRIBUTION_VERSIONS_TITLE = 'export_contribution_versions_title';
    protected const EXPORT_CONTRIBUTION_VERSIONS_EXPLANATION = 'export_contribution_versions_explanation';
    protected const EXPORT_CONTRIBUTION_VERSIONS_BODY_TEXT = 'export_contribution_versions_body_text';
    protected const EXPORT_CONTRIBUTION_VERSIONS_CREATED_AT = 'export_contribution_versions_created_at';
    protected const EXPORT_CONTRIBUTION_VERSIONS_UPDATED_AT = 'export_contribution_versions_updated_at';
    protected const EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT = 'export_contribution_versions_votes_count';
    protected const EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT_OK = 'export_contribution_versions_votes_count_ok';
    protected const EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT_MITIGE = 'export_contribution_versions_votes_count_mitige';
    protected const EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT_NOK = 'export_contribution_versions_votes_count_nok';
    protected const EXPORT_CONTRIBUTION_ID = 'export_contribution_id';
    protected const EXPORT_CONTRIBUTION_PUBLISHED = 'export_contribution_published';
    protected const EXPORT_CONTRIBUTION_PUBLISHED_AT = 'export_contribution_published_at';
    protected const EXPORT_CONTRIBUTION_AUTHOR = 'export_contribution_author';
    protected const EXPORT_CONTRIBUTION_AUTHOR_EMAIL = 'export_contribution_author_email';
    protected const EXPORT_CONTRIBUTION_AUTHOR_PHONE = 'export_contribution_author_phone';
    protected const EXPORT_CONTRIBUTION_CREATED_AT = 'export_contribution_created_at';
    protected const EXPORT_CONTRIBUTION_UPDATED_AT = 'export_contribution_updated_at';
    protected const EXPORT_CONTRIBUTION_ANONYMOUS = 'export_contribution_anonymous';
    protected const EXPORT_CONTRIBUTION_DRAFT = 'export_contribution_draft';
    protected const EXPORT_CONTRIBUTION_UNDRAFT_AT = 'export_contribution_undraft_at';
    protected const EXPORT_CONTRIBUTION_ACCOUNT = 'export_contribution_account';
    protected const EXPORT_CONTRIBUTION_NO_ACCOUNT_EMAIL = 'export_contribution_no_account_email';
    protected const EXPORT_CONTRIBUTION_NO_ACCOUNT_EMAIL_CONFIRMED = 'export_contribution_no_account_email_confirmed';
    protected const EXPORT_CONTRIBUTION_INTERNAL_COMM = 'export_contribution_internal_comm';
    protected const EXPORT_PROPOSAL_PUBLICATION_STATUS_PUBLISHED = 'export_proposal_publication_status_published';
    protected const EXPORT_PROPOSAL_PUBLICATION_STATUS_TRASHED = 'export_proposal_publication_status_trashed';
    protected const EXPORT_PROPOSAL_PUBLICATION_STATUS_ARCHIVED = 'export_proposal_publication_status_archived';
    protected const EXPORT_PROPOSAL_PUBLICATION_STATUS_TRASHED_NOT_VISIBLE = 'export_proposal_publication_status_trashed_not_visible';
    protected const EXPORT_PROPOSAL_PUBLICATION_STATUS_UNPUBLISHED = 'export_proposal_publication_status_unpublished';
    protected const EXPORT_PROPOSAL_PUBLICATION_STATUS_DRAFT = 'export_proposal_publication_status_draft';
    protected const EXPORT_PROPOSAL_PUBLICATION_STATUS_DELETED = 'export_proposal_publication_status_deleted';
    protected const EXPORT_PROPOSAL_PUBLICATION_STATUSES = [
        ProposalPublicationStatus::PUBLISHED => self::EXPORT_PROPOSAL_PUBLICATION_STATUS_PUBLISHED,
        ProposalPublicationStatus::TRASHED => self::EXPORT_PROPOSAL_PUBLICATION_STATUS_TRASHED,
        ProposalPublicationStatus::ARCHIVED => self::EXPORT_PROPOSAL_PUBLICATION_STATUS_ARCHIVED,
        ProposalPublicationStatus::TRASHED_NOT_VISIBLE => self::EXPORT_PROPOSAL_PUBLICATION_STATUS_TRASHED_NOT_VISIBLE,
        ProposalPublicationStatus::UNPUBLISHED => self::EXPORT_PROPOSAL_PUBLICATION_STATUS_UNPUBLISHED,
        ProposalPublicationStatus::DRAFT => self::EXPORT_PROPOSAL_PUBLICATION_STATUS_DRAFT,
        ProposalPublicationStatus::DELETED => self::EXPORT_PROPOSAL_PUBLICATION_STATUS_DELETED,
    ];
    protected const EXPORT_CONTRIBUTION_ARGUMENT_PUBLISHED_AT = 'export_contribution_argument_published_at';
    protected const EXPORT_CONTRIBUTION_ARGUMENT_AUTHOR_ID = 'export_contribution_argument_author_id';
    protected const EXPORT_CONTRIBUTION_ARGUMENT_AUTHOR_USERNAME = 'export_contribution_argument_author_username';
    protected const EXPORT_CONTRIBUTION_ARGUMENT_AUTHOR_USER_TYPE_NAME = 'export_contribution_argument_author_user_type_name';
    protected const EXPORT_CONTRIBUTION_ARGUMENT_AUTHOR_ZIP_CODE = 'export_contribution_argument_author_zip_code';
    protected const EXPORT_CONTRIBUTION_ARGUMENT_AUTHOR_ACCOUNT = 'export_contribution_argument_author_account';
    protected const EXPORT_CONTRIBUTION_ARGUMENT_CONTENT = 'export_contribution_argument_content';
    protected const EXPORT_CONTRIBUTION_ARGUMENT_TYPE = 'export_contribution_argument_type';
    protected const EXPORT_CONTRIBUTION_ARGUMENT_VOTE_NUMBER = 'export_contribution_argument_vote_number';
    protected const EXPORT_CONTRIBUTION_ARGUMENT_CREATED_AT = 'export_contribution_argument_created_at';
    protected const EXPORT_CONTRIBUTION_ARGUMENT_UPDATED_AT = 'export_contribution_argument_updated_at';
    protected const EXPORT_CONTRIBUTION_ARGUMENT_TRASHED_AT = 'export_contribution_argument_trashed_at';
    protected const EXPORT_CONTRIBUTION_ARGUMENT_TRASHED_REASON = 'export_contribution_argument_trashed_reason';
    protected const EXPORT_CONTRIBUTION_ARGUMENT_AUTHOR_IS_EMAIL_CONFIRMED = 'export_contribution_argument_author_is_email_confirmed';
    protected const EXPORT_CONTRIBUTION_ARGUMENT_AUTHOR_EMAIL = 'export_contribution_argument_author_email';
    protected const EXPORT_CONTRIBUTION_ARGUMENT_AUTHOR_INTERNAL_COMMUNICATION = 'export_contribution_argument_author_internal_communication';
    protected const EXPORT_CONTRIBUTION_ARGUMENT_AUTHOR_EXTERNAL_COMMUNICATION = 'export_contribution_argument_author_external_communication';
    protected const EXPORT_CONTRIBUTION_ARGUMENT_DEBATE_URL = 'export_contribution_argument_debate_url';
    protected const EXPORT_CONTRIBUTION_ARGUMENT_GEOIP_COUNTRY_NAME = 'export_contribution_argument_geoip_country_name';
    protected const EXPORT_CONTRIBUTION_ARGUMENT_GEOIP_REGION_NAME = 'export_contribution_argument_geoip_region_name';
    protected const EXPORT_CONTRIBUTION_ARGUMENT_GEOIP_CITY_NAME = 'export_contribution_argument_geoip_city_name';
    protected const EXPORT_CONTRIBUTION_ARGUMENT_TYPE_FOR = 'export_contribution_argument_type_for';
    protected const EXPORT_CONTRIBUTION_ARGUMENT_TYPE_AGAINST = 'export_contribution_argument_type_against';
    protected const EXPORT_CONTRIBUTION_ARGUMENT_TYPES = [
        ForOrAgainstType::FOR => self::EXPORT_CONTRIBUTION_ARGUMENT_TYPE_FOR,
        ForOrAgainstType::AGAINST => self::EXPORT_CONTRIBUTION_ARGUMENT_TYPE_AGAINST,
    ];
    protected const EXPORT_VOTE_PUBLISHED_AT = 'export_vote_published_at';
    protected const EXPORT_VOTE_TYPE = 'export_vote_type';
    protected const EXPORT_VOTE_AUTHOR_ID = 'export_vote_author_id';
    protected const EXPORT_VOTE_SOURCE = 'export_vote_source';
    protected const EXPORT_VOTE_AUTHOR_ZIP_CODE = 'export_vote_author_zip_code';
    protected const EXPORT_VOTE_AUTHOR_USERNAME = 'export_vote_author_username';
    protected const EXPORT_VOTE_AUTHOR_IS_EMAIL_CONFIRMED = 'export_vote_author_is_email_confirmed';
    protected const EXPORT_VOTE_AUTHOR_EMAIL = 'export_vote_author_email';
    protected const EXPORT_VOTE_AUTHOR_USER_TYPE_NAME = 'export_vote_author_user_type_name';
    protected const EXPORT_VOTE_DEBATE_URL = 'export_vote_debate_url';
    protected const EXPORT_VOTE_GEOIP_COUNTRY_CODE = 'export_vote_geoip_country_code';
    protected const EXPORT_VOTE_GEOIP_REGION_NAME = 'export_vote_geoip_region_name';
    protected const EXPORT_VOTE_GEOIP_CITY_NAME = 'export_vote_geoip_city_name';
    protected const EXPORT_VOTE_TYPE_FOR = 'export_vote_type_for';
    protected const EXPORT_VOTE_TYPE_AGAINST = 'export_vote_type_against';
    protected const EXPORT_USER_GROUPS_TITLE = 'export_user_groups_title';
    protected const EXPORT_USER_GROUPS_DESCRIPTION = 'export_user_groups_description';
    protected const EXPORT_USER_GROUPS_COUNT_USER_GROUPS = 'export_user_groups_count_user_groups';
    protected const EXPORT_USER_GROUPS_CREATED_AT = 'export_user_groups_created_at';
    protected const EXPORT_USER_GROUPS_UPDATED_AT = 'export_user_groups_updated_at';
    protected const EXPORT_VOTE_TYPES = [
        ForOrAgainstType::FOR => self::EXPORT_VOTE_TYPE_FOR,
        ForOrAgainstType::AGAINST => self::EXPORT_VOTE_TYPE_AGAINST,
    ];

    public function __construct(protected TranslatorInterface $translator)
    {
    }

    protected function getReadableBoolean(bool $value): string
    {
        return $value ? 'Oui' : 'Non';
    }

    protected function getNullableDatetime(?\DateTimeInterface $dateTime): ?string
    {
        return (null !== $dateTime) ? $dateTime->format('Y-m-d H:i:s') : null;
    }

    /**
     * @param array<mixed> $array
     * @param array<mixed> $excludedKeys
     *
     * @return array<mixed>
     */
    protected function translateHeaders(array $array, array $excludedKeys = []): array
    {
        $translatedArray = [];
        foreach ($array as $key => $value) {
            if (\in_array($key, $excludedKeys, true)) {
                $translatedArray[$key] = $value;

                continue;
            }

            $translatedArray[$this->translator->trans($key)] = $value;
        }

        return $translatedArray;
    }
}
