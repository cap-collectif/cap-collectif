@export
Feature: Export Commands

Background:
  Given feature "export" is enabled

@parallel-scenario
Scenario: Admin wants to export consultation steps
  Given I run "capco:export:consultation"
  Then the command exit code should be 0

@parallel-scenario
Scenario: Admin wants to export collect steps
  Given I run "capco:export:proposalStep"
  Then the command exit code should be 0
  And exported file with name "budget-avec-vote-limite_collecte-avec-vote-simple-limite.csv" should contain:
  """
  contribution_type,proposal_id,proposal_reference,proposal_title,proposal_createdAt,proposal_publishedAt,proposal_updatedAt,proposal_publicationStatus,proposal_trashedAt,proposal_trashedReason,proposal_link,proposal_author_id,proposal_author_username,proposal_author_email,proposal_author_userType_id,proposal_author_userType_name,proposal_status_name,proposal_estimation,proposal_category_name,proposal_theme_title,proposal_formattedAddress,proposal_district_name,proposal_illustration,proposal_summary,proposal_description,proposal_votes_id,proposal_votes_createdAt,proposal_votes_publishedAt,proposal_votes_published,proposal_votes_anonymous,proposal_votes_author_id,proposal_votes_author_username,proposal_votes_ranking,proposal_votes_author_userType_id,proposal_votes_author_userType_name,proposal_comments_id,proposal_comments_body,proposal_comments_parent,proposal_comments_createdAt,proposal_comments_publishedAt,proposal_comments_updatedAt,proposal_comments_author_id,proposal_comments_author_username,proposal_comments_author_userType_id,proposal_comments_author_userType_name,proposal_comments_author_email,proposal_comments_pinned,proposal_comments_publicationStatus,proposal_comments_vote_id,proposal_comments_vote_createdAt,proposal_comments_vote_publishedAt,proposal_comments_vote_published,proposal_comments_vote_author_id,proposal_comments_vote_author_username,proposal_comments_vote_author_userType_id,proposal_comments_vote_author_userType_name,proposal_news_id,proposal_news_title,proposal_news_themes,proposal_news_linkedProjects,proposal_news_linkedProposal,proposal_news_createdAt,proposal_news_updatedAt,proposal_news_publishedAt,proposal_news_publicationStatus,proposal_news_commentable,proposal_news_displayedOnBlog,proposal_news_authors_id,proposal_news_authors_username,proposal_news_authors_userType_id,proposal_news_authors_userType_name,proposal_news_comments_id,proposal_news_comments_body,proposal_news_comments_parent,proposal_news_comments_createdAt,proposal_news_comments_updatedAt,proposal_news_comments_author_id,proposal_news_comments_author_username,proposal_news_comments_author_userType_id,proposal_news_comments_author_userType_name,proposal_news_comments_author_email,proposal_news_comments_pinned,proposal_news_comments_publicationStatus,proposal_news_comments_vote_id,proposal_news_comments_vote_createdAt,proposal_news_comments_vote_publishedAt,proposal_news_comments_vote_published,proposal_news_comments_vote_author_id,proposal_news_comments_vote_author_username,proposal_news_comments_vote_author_userType_id,proposal_news_comments_vote_author_userType_name,proposal_news_comments_reportings_id,proposal_news_comments_reportings_createdAt,proposal_news_comments_reportings_published,proposal_news_comments_reportings_author_id,proposal_news_comments_reportings_author_username,proposal_news_comments_reportings_author_userType_id,proposal_news_comments_reportings_author_userType_name,proposal_reportings_id,proposal_reportings_body,proposal_reportings_createdAt,proposal_reportings_author_id,proposal_reportings_author_username,proposal_reportings_author_userType_id,proposal_reportings_author_userType_name
  proposal,proposal17,7-1,"Proposition 17","2018-11-21 08:33:50","2015-03-01 00:00:00","2018-11-21 08:33:50",PUBLISHED,,,https://capco.dev/projects/budget-avec-vote-limite/collect/collecte-avec-vote-simple-limite/proposals/proposition-17,user5,user,user@test.com,1,Citoyen,,,,,,,,,"Itaque inventore a sed est eligendi quidem aut. Rem id aut et hic deserunt est qui.",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
  proposal,proposal18,7-2,"Proposition 18","2018-11-21 08:33:50","2015-03-01 00:00:00","2018-11-21 08:33:50",PUBLISHED,,,https://capco.dev/projects/budget-avec-vote-limite/collect/collecte-avec-vote-simple-limite/proposals/proposition-18,user1,lbrunet,lbrunet@jolicode.com,1,Citoyen,,,,,,,,,"Qui dolores perferendis expedita non. Harum enim itaque illum commodi sapiente.",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
  """

@parallel-scenario
Scenario: Admin wants to export questionnaire steps
  Given I run "capco:export:questionnaire"
  Then the command exit code should be 0

@database
Scenario: User want to export his datas and 7 days after the cron delete the zip archive
  Given I run "capco:export:user userAdmin"
  And the command exit code should be 0
  Then there should be a personal data archive for user "userAdmin"
  And I run "capco:user_archives:delete"
  And the command exit code should be 0
  Then the archive for user "userAdmin" should be deleted

@parallel-scenario
Scenario: Admin wants to export users
  Given I run "capco:export:users"
  Then the command exit code should be 0
