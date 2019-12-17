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
        if ('benchmark' === $environment) {
            return $this->installBenchmarkFixtures();
        }

        return $this->installDevFixtures();
    }

    private function installBenchmarkFixtures(): array
    {
        return [
            __DIR__ . '/../../../../../fixtures/Benchmark/UserType.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/MapToken.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/User.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/Locale.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/MenuItem.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/FooterSocialNetwork.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/Theme.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/OpinionType.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/Project.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/ConsultationStep.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/Consultation.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/CollectStep.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/SelectionStep.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/SiteParameter.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/SiteColor.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/SiteImage.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/QuestionnaireStep.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/ProjectAbstractStep.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/Opinion.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/Category.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/Source.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/Argument.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/ProposalForm.yaml',
            __DIR__ .
                '/../../../../../fixtures/Benchmark/ProposalFormNotificationConfiguration.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/ProposalDistrict.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/Questionnaire.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/QuestionChoice.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/MultipleChoiceQuestion.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/QuestionnaireAbstractQuestion.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/QuestionChoice.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/ProposalCategory.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/Status.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/Proposal.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/Reply.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/Post.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/ProposalCollectVote.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/ProposalComment.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/CommentVote.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/Follower.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/HighlightedContent.yaml',
            __DIR__ . '/../../../../../fixtures/Benchmark/Event.yaml'
        ];
    }

    private function installProdFixtures(): array
    {
        return [
            __DIR__ . '/../../../../../fixtures/Prod/MediaContext.yaml',
            __DIR__ . '/../../../../../fixtures/Prod/MediaCategory.yaml',
            __DIR__ . '/../../../../../fixtures/Prod/Locale.yaml',
            __DIR__ . '/../../../../../fixtures/Prod/ContactForm.yaml',
            __DIR__ . '/../../../../../fixtures/Prod/RegistrationForm.yaml',
            __DIR__ . '/../../../../../fixtures/Prod/Media.yaml',
            __DIR__ . '/../../../../../fixtures/Prod/CategoryImage.yaml',
            __DIR__ . '/../../../../../fixtures/Prod/UserType.yaml',
            __DIR__ . '/../../../../../fixtures/Prod/User.yaml',
            __DIR__ . '/../../../../../fixtures/Prod/MenuItem.yaml',
            __DIR__ . '/../../../../../fixtures/Prod/SiteParameter.yaml',
            __DIR__ . '/../../../../../fixtures/Prod/SocialNetwork.yaml',
            __DIR__ . '/../../../../../fixtures/Prod/FooterSocialNetwork.yaml',
            __DIR__ . '/../../../../../fixtures/Prod/Page.yaml',
            __DIR__ . '/../../../../../fixtures/Prod/Category.yaml',
            __DIR__ . '/../../../../../fixtures/Prod/SiteImage.yaml',
            __DIR__ . '/../../../../../fixtures/Prod/SiteColor.yaml',
            __DIR__ . '/../../../../../fixtures/Prod/Section.yaml',
            __DIR__ . '/../../../../../fixtures/Prod/PresentationStep.yaml',
            __DIR__ . '/../../../../../fixtures/Prod/OtherStep.yaml',
            __DIR__ . '/../../../../../fixtures/Prod/ProjectAbstractStep.yaml',
            __DIR__ . '/../../../../../fixtures/Prod/ProjectType.yaml',
            __DIR__ . '/../../../../../fixtures/Prod/Project.yaml',
            __DIR__ . '/../../../../../fixtures/Prod/ProjectAuthor.yaml',
            __DIR__ . '/../../../../../fixtures/Prod/Post.yaml',
            __DIR__ . '/../../../../../fixtures/Prod/PostTranslation.yaml',
            __DIR__ . '/../../../../../fixtures/Prod/Event.yaml',
            __DIR__ . '/../../../../../fixtures/Prod/HighlightedContent.yaml',
            __DIR__ . '/../../../../../fixtures/Prod/FranceConnectSSOConfiguration.yaml'
        ];
    }

    private function installDevFixtures(): array
    {
        return [
            __DIR__ . '/../../../../../fixtures/Dev/MediaContext.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/MediaCategory.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/Media.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/Locale.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/CategoryImage.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/RegistrationForm.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/Group.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/EmailDomain.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/UserNotificationsConfiguration.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/UserType.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/User.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/UserArchive.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/Page.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/PageTranslation.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/MenuItem.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/SiteParameter.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/SiteImage.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/SiteColor.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/NewsletterSubscription.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/SocialNetwork.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/FooterSocialNetwork.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/Theme.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/ThemeTranslation.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/ConsultationStep.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/Consultation.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/OpinionType.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/AppendixType.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/OpinionTypeAppendixType.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/ProjectType.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/Project.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/ProjectAuthor.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/ProjectDistrict.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/PresentationStep.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/RankingStep.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/OtherStep.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/Synthesis.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/SynthesisStep.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/CollectStep.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/SelectionStep.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/Requirement.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/UserRequirement.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/QuestionnaireStep.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/ProjectAbstractStep.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/Answer.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/Opinion.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/OpinionAppendix.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/OpinionVote.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/OpinionVersion.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/OpinionVersionVote.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/Category.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/Source.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/SourceVote.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/Argument.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/ArgumentVote.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/Questionnaire.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/ProposalForm.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/ProposalFormNotificationConfiguration.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/ProposalCategory.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/Status.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/SectionQuestion.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/QuestionChoice.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/SimpleQuestion.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/MediaQuestion.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/MultipleChoiceQuestion.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/QuestionnaireAbstractQuestion.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/BackgroundStyle.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/BorderStyle.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/ProposalDistrict.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/Proposal.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/Selection.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/Reply.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/ProposalEvaluation.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/ValueResponse.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/MediaResponse.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/ProgressStep.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/ProposalSelectionVote.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/ProposalCollectVote.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/ProposalComment.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/Post.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/PostTranslation.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/PostComment.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/EventReview.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/Event.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/EventRegistration.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/EventComment.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/CommentVote.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/Video.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/Section.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/HighlightedContent.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/UserGroup.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/Follower.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/Reporting.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/MultipleChoiceQuestionLogicJumpCondition.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/LogicJump.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/SectionQuestion.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/PublicApiToken.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/MapToken.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/ContactForm.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/FranceConnectSSOConfiguration.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/Oauth2SSOConfiguration.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/UserConnection.yaml',
            __DIR__ . '/../../../../../fixtures/Dev/ProjectDistrictPositioner.yaml'
        ];
    }
}
