<?php

declare(strict_types=1);

namespace Capco\AppBundle\DataFixtures\ORM;

use Hautelook\AliceBundle\FixtureLocatorInterface;
use Nelmio\Alice\IsAServiceTrait;

final class CustomOrderFilesLocator implements FixtureLocatorInterface
{
    use IsAServiceTrait;

    private $decoratedFixtureLocator;

    private $step = 0;

    public function __construct(FixtureLocatorInterface $decoratedFixtureLocator)
    {
        $this->decoratedFixtureLocator = $decoratedFixtureLocator;
    }

    /**
     * Re-order the files found by the decorated finder.
     *
     * {@inheritdoc}
     */
    public function locateFiles(array $bundles, string $environment): array
    {
        if ('prod' === $environment) {
            return $this->installProdFixtures();
        }

        return $this->installDevFixtures();
    }

    private function installProdFixtures(): array
    {
        return [
            __DIR__ . '/Prod/MediaContext.yml',
            __DIR__ . '/Prod/MediaCategory.yml',
            __DIR__ . '/Prod/ContactForm.yml',
            __DIR__ . '/Prod/RegistrationForm.yml',
            __DIR__ . '/Prod/Media.yml',
            __DIR__ . '/Prod/CategoryImage.yml',
            __DIR__ . '/Prod/UserType.yml',
            __DIR__ . '/Prod/User.yml',
            __DIR__ . '/Prod/MenuItem.yml',
            __DIR__ . '/Prod/SiteParameter.yml',
            __DIR__ . '/Prod/SocialNetwork.yml',
            __DIR__ . '/Prod/FooterSocialNetwork.yml',
            __DIR__ . '/Prod/Page.yml',
            __DIR__ . '/Prod/Category.yml',
            __DIR__ . '/Prod/SiteImage.yml',
            __DIR__ . '/Prod/SiteColor.yml',
            __DIR__ . '/Prod/Section.yml',
            __DIR__ . '/Prod/PresentationStep.yml',
            __DIR__ . '/Prod/OtherStep.yml',
            __DIR__ . '/Prod/ProjectAbstractStep.yml',
            __DIR__ . '/Prod/ProjectType.yml',
            __DIR__ . '/Prod/Project.yml',
            __DIR__ . '/Prod/ProjectAuthor.yml',
            __DIR__ . '/Prod/Post.yml',
            __DIR__ . '/Prod/PostTranslation.yml',
            __DIR__ . '/Prod/Event.yml',
            __DIR__ . '/Prod/HighlightedContent.yml',
            __DIR__ . '/Prod/FranceConnectSSOConfiguration.yml'
        ];
    }

    private function installDevFixtures(): array
    {
        return [
            __DIR__ . '/Dev/MediaContext.yml',
            __DIR__ . '/Dev/MediaCategory.yml',
            __DIR__ . '/Dev/Media.yml',
            __DIR__ . '/Dev/CategoryImage.yml',
            __DIR__ . '/Dev/RegistrationForm.yml',
            __DIR__ . '/Dev/Group.yml',
            __DIR__ . '/Dev/EmailDomain.yml',
            __DIR__ . '/Dev/UserNotificationsConfiguration.yml',
            __DIR__ . '/Dev/UserType.yml',
            __DIR__ . '/Dev/User.yml',
            __DIR__ . '/Dev/UserArchive.yml',
            __DIR__ . '/Dev/Page.yml',
            __DIR__ . '/Dev/PageTranslation.yml',
            __DIR__ . '/Dev/MenuItem.yml',
            __DIR__ . '/Dev/SiteParameter.yml',
            __DIR__ . '/Dev/SiteImage.yml',
            __DIR__ . '/Dev/SiteColor.yml',
            __DIR__ . '/Dev/NewsletterSubscription.yml',
            __DIR__ . '/Dev/SocialNetwork.yml',
            __DIR__ . '/Dev/FooterSocialNetwork.yml',
            __DIR__ . '/Dev/Theme.yml',
            __DIR__ . '/Dev/ThemeTranslation.yml',
            __DIR__ . '/Dev/ConsultationStep.yml',
            __DIR__ . '/Dev/Consultation.yml',
            __DIR__ . '/Dev/OpinionType.yml',
            __DIR__ . '/Dev/AppendixType.yml',
            __DIR__ . '/Dev/OpinionTypeAppendixType.yml',
            __DIR__ . '/Dev/ProjectType.yml',
            __DIR__ . '/Dev/Project.yml',
            __DIR__ . '/Dev/ProjectAuthor.yml',
            __DIR__ . '/Dev/ProjectDistrict.yml',
            __DIR__ . '/Dev/PresentationStep.yml',
            __DIR__ . '/Dev/RankingStep.yml',
            __DIR__ . '/Dev/OtherStep.yml',
            __DIR__ . '/Dev/Synthesis.yml',
            __DIR__ . '/Dev/SynthesisStep.yml',
            __DIR__ . '/Dev/CollectStep.yml',
            __DIR__ . '/Dev/SelectionStep.yml',
            __DIR__ . '/Dev/Requirement.yml',
            __DIR__ . '/Dev/UserRequirement.yml',
            __DIR__ . '/Dev/QuestionnaireStep.yml',
            __DIR__ . '/Dev/ProjectAbstractStep.yml',
            __DIR__ . '/Dev/Answer.yml',
            __DIR__ . '/Dev/Opinion.yml',
            __DIR__ . '/Dev/OpinionAppendix.yml',
            __DIR__ . '/Dev/OpinionVote.yml',
            __DIR__ . '/Dev/OpinionVersion.yml',
            __DIR__ . '/Dev/OpinionVersionVote.yml',
            __DIR__ . '/Dev/Category.yml',
            __DIR__ . '/Dev/Source.yml',
            __DIR__ . '/Dev/SourceVote.yml',
            __DIR__ . '/Dev/Argument.yml',
            __DIR__ . '/Dev/ArgumentVote.yml',
            __DIR__ . '/Dev/Questionnaire.yml',
            __DIR__ . '/Dev/ProposalForm.yml',
            __DIR__ . '/Dev/ProposalFormNotificationConfiguration.yml',
            __DIR__ . '/Dev/ProposalCategory.yml',
            __DIR__ . '/Dev/Status.yml',
            __DIR__ . '/Dev/SectionQuestion.yml',
            __DIR__ . '/Dev/QuestionChoice.yml',
            __DIR__ . '/Dev/SimpleQuestion.yml',
            __DIR__ . '/Dev/MediaQuestion.yml',
            __DIR__ . '/Dev/MultipleChoiceQuestion.yml',
            __DIR__ . '/Dev/QuestionnaireAbstractQuestion.yml',
            __DIR__ . '/Dev/BackgroundStyle.yml',
            __DIR__ . '/Dev/BorderStyle.yml',
            __DIR__ . '/Dev/ProposalDistrict.yml',
            __DIR__ . '/Dev/Proposal.yml',
            __DIR__ . '/Dev/Selection.yml',
            __DIR__ . '/Dev/Reply.yml',
            __DIR__ . '/Dev/ProposalEvaluation.yml',
            __DIR__ . '/Dev/ValueResponse.yml',
            __DIR__ . '/Dev/MediaResponse.yml',
            __DIR__ . '/Dev/ProgressStep.yml',
            __DIR__ . '/Dev/ProposalSelectionVote.yml',
            __DIR__ . '/Dev/ProposalCollectVote.yml',
            __DIR__ . '/Dev/ProposalComment.yml',
            __DIR__ . '/Dev/Post.yml',
            __DIR__ . '/Dev/PostTranslation.yml',
            __DIR__ . '/Dev/PostComment.yml',
            __DIR__ . '/Dev/EventReview.yml',
            __DIR__ . '/Dev/Event.yml',
            __DIR__ . '/Dev/EventRegistration.yml',
            __DIR__ . '/Dev/EventComment.yml',
            __DIR__ . '/Dev/CommentVote.yml',
            __DIR__ . '/Dev/Video.yml',
            __DIR__ . '/Dev/Section.yml',
            __DIR__ . '/Dev/HighlightedContent.yml',
            __DIR__ . '/Dev/UserGroup.yml',
            __DIR__ . '/Dev/Follower.yml',
            __DIR__ . '/Dev/Reporting.yml',
            __DIR__ . '/Dev/MultipleChoiceQuestionLogicJumpCondition.yml',
            __DIR__ . '/Dev/LogicJump.yml',
            __DIR__ . '/Dev/SectionQuestion.yml',
            __DIR__ . '/Dev/PublicApiToken.yml',
            __DIR__ . '/Dev/MapToken.yml',
            __DIR__ . '/Dev/ContactForm.yml',
            __DIR__ . '/Dev/FranceConnectSSOConfiguration.yml',
            __DIR__ . '/Dev/Oauth2SSOConfiguration.yml',
            __DIR__ . '/Dev/UserConnection.yml',
            __DIR__ . '/Dev/ProjectDistrictPositioner.yml'
        ];
    }
}
