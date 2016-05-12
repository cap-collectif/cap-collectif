<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Answer;
use Capco\AppBundle\Entity\ProposalVote;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Response;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Doctrine\ORM\EntityManager;
use Symfony\Bundle\TwigBundle\TwigEngine;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Translation\TranslatorInterface;

class ProjectDownloadResolver
{
    protected $acceptedFormats = [
        'xls',
        'xlsx',
        'csv',
    ];

    protected $contentTypes = [
        'xls' => 'application/vnd.ms-excel',
        'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'csv' => 'text/csv',
    ];

    protected $consultationHeaders = [
        'id',
        'author',
        'author_id',
        'user_type',
        'created',
        'updated',
        'title',
        'content_type',
        'category',
        'related_object',
        'content',
        'link',
        'score',
        'total_votes',
        'votes_ok',
        'votes_mitigated',
        'votes_nok',
        'sources',
        'total_arguments',
        'arguments_ok',
        'arguments_nok',
        'trashed',
        'trashed_date',
        'trashed_reason',
    ];

    protected $collectHeaders = [
        'id',
        'title',
        'content_type',
        'author',
        'author_id',
        'author_email',
        'user_type',
        'content',
        'theme',
        'district',
        'status',
        'estimation',
        'answer',
        'nbVotes',
        'created',
        'updated',
        'link',
        'trashed',
        'trashed_date',
        'trashed_reason',
    ];

    protected $em;
    protected $templating;
    protected $translator;
    protected $urlResolver;
    protected $headers;
    protected $data;

    public function __construct(EntityManager $em, TwigEngine $templating, TranslatorInterface $translator, UrlResolver $urlResolver)
    {
        $this->em = $em;
        $this->templating = $templating;
        $this->translator = $translator;
        $this->urlResolver = $urlResolver;
        $this->headers = [];
        $this->data = [];
    }

    public function getQuestionnaireStepHeaders(QuestionnaireStep $step)
    {
        $headers = [
            'id',
            'author',
            'phone',
            'created',
            'anonymous',
        ];

        if ($step->getQuestionnaire()) {
            foreach ($step->getQuestionnaire()->getRealQuestions() as $question) {
                $headers[] = ['label' => $question->getTitle(), 'raw' => true];
            }
        }

        return $headers;
    }

    public function getContent(AbstractStep $step, $format)
    {
        if (null == $step) {
            throw new NotFoundHttpException('Step not found');
        }

        if (!$this->isFormatSupported($format)) {
            throw new \Exception('Wrong format');
        }

        if ($step instanceof ConsultationStep) {
            $this->headers = $this->consultationHeaders;
            $data = $this->getConsultationStepData($step);
        } elseif ($step instanceof CollectStep) {
            $this->headers = $this->collectHeaders;
            $data = $this->getCollectStepData($step);
        } elseif ($step instanceof QuestionnaireStep) {
            $this->headers = $this->getQuestionnaireStepHeaders($step);
            $data = $this->getQuestionnaireStepData($step);
        } else {
            throw new \Exception('Step must be of type collect, questionnaire or consultation');
        }

        $title = $step->getProject() ? $step->getProject()->getTitle() . '_' : '';
        $title .= $step->getTitle();

        $content = $this->templating->render('CapcoAppBundle:Project:download.xls.twig',
            [
                'title' => $title,
                'format' => $format,
                'headers' => $this->headers,
                'data' => $data,
                'locale' => $this->translator->getLocale(),
            ]
        );

        return $content;
    }

    public function isFormatSupported($format)
    {
        return in_array($format, $this->acceptedFormats);
    }

    public function getContentType($format)
    {
        return $this->contentTypes[$format];
    }

    /*
     * Add item in correct section
     */
    public function addItemToData($item)
    {
        $this->data[] = $item;
    }

    // ********************************** Generate data items **************************************

    public function getConsultationStepData(ConsultationStep $consultationStep)
    {
        $this->data = [];

        // Fetch data
        $opinions = $this->em->getRepository('CapcoAppBundle:Opinion')->getEnabledByConsultationStep($consultationStep);
        $opinionsVotes = $this->em->getRepository('CapcoAppBundle:OpinionVote')->getEnabledByConsultationStep($consultationStep);
        $versions = $this->em->getRepository('CapcoAppBundle:OpinionVersion')->getEnabledByConsultationStep($consultationStep);
        $versionsVotes = $this->em->getRepository('CapcoAppBundle:OpinionVersionVote')->getEnabledByConsultationStep($consultationStep);
        $arguments = $this->em->getRepository('CapcoAppBundle:Argument')->getEnabledByConsultationStep($consultationStep);
        $sources = $this->em->getRepository('CapcoAppBundle:Source')->getEnabledByConsultationStep($consultationStep);

        // Create items from data
        $this->getOpinionsData($opinions);
        $this->getVotesData($opinionsVotes);
        $this->getVersionsData($versions);
        $this->getVotesData($versionsVotes);
        $this->getArgumentsData($arguments);
        $this->getSourcesData($sources);

        return $this->data;
    }

    public function getCollectStepData(CollectStep $collectStep)
    {
        $this->data = [];

        // Proposals
        $proposals = $this->em
            ->getRepository('CapcoAppBundle:Proposal')
            ->getEnabledByProposalForm($collectStep->getProposalForm());

        $this->getProposalsData($proposals);

        return $this->data;
    }

    public function getQuestionnaireStepData(QuestionnaireStep $questionnaireStep)
    {
        $this->data = [];

        $replies = [];

        if ($questionnaireStep->getQuestionnaire()) {
            // Replies
            $replies = $this->em
                ->getRepository('CapcoAppBundle:Reply')
                ->findBy(
                    [
                        'questionnaire' => $questionnaireStep->getQuestionnaire(),
                        'enabled' => true,
                    ]
                );
        }

        $this->getRepliesData($replies);

        return $this->data;
    }

    public function getProposalsData($proposals)
    {
        foreach ($proposals as $proposal) {
            if ($proposal->isEnabled()) {
                $this->addItemToData($this->getProposalItem($proposal));
                $this->getProposalVotesData($proposal->getVotes());
            }
        }
    }

    public function getProposalVotesData($votes)
    {
        foreach ($votes as $vote) {
            if ($vote->isConfirmed()) {
                $this->addItemToData($this->getProposalVoteItem($vote));
            }
        }
    }

    public function getOpinionsData($opinions)
    {
        foreach ($opinions as $opinion) {
            if ($opinion->getIsEnabled()) {
                $this->addItemToData($this->getOpinionItem($opinion));
            }
        }
    }

    public function getVersionsData($versions)
    {
        foreach ($versions as $version) {
            if ($version->isEnabled()) {
                $this->addItemToData($this->getOpinionVersionItem($version));
            }
        }
    }

    public function getArgumentsData($arguments)
    {
        foreach ($arguments as $argument) {
            if ($argument->getIsEnabled()) {
                $this->addItemToData($this->getArgumentItem($argument));
                $this->getVotesData($argument->getVotes());
            }
        }
    }

    public function getSourcesData($sources)
    {
        foreach ($sources as $source) {
            if ($source->getIsEnabled()) {
                $this->addItemToData($this->getSourceItem($source));
                $this->getVotesData($source->getVotes());
            }
        }
    }

    public function getVotesData($votes)
    {
        foreach ($votes as $vote) {
            if ($vote->isConfirmed()) {
                $this->addItemToData($this->getVoteItem($vote));
            }
        }
    }

    public function getRepliesData($replies)
    {
        foreach ($replies as $reply) {
            if ($reply->isEnabled()) {
                $this->addItemToData($this->getReplyItem($reply));
            }
        }
    }

    // *************************** Generate items *******************************************

    private function getProposalItem(Proposal $proposal)
    {
        $na = $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle');
        $author = $proposal->getAuthor();
        $authorName = $author ? $author->getUsername() : $this->translator->trans('project_download.values.user_removed', [], 'CapcoAppBundle');
        $authorId = $author ? $author->getId() : $na;
        $authorType = $author && $author->getUserType() ? $author->getUserType()->getName() : $na;
        $authorEmail = $author ? $author->getEmail() : $na;

        return $item = [
            'id' => $proposal->getId(),
            'title' => $proposal->getTitle(),
            'content_type' => $this->translator->trans('project_download.values.content_type.proposal', [], 'CapcoAppBundle'),
            'content' => $this->getProposalContent($proposal),
            'link' => $this->urlResolver->getObjectUrl($proposal, true),
            'created' => $this->dateToString($proposal->getCreatedAt()),
            'updated' => $proposal->getUpdatedAt() != $proposal->getCreatedAt() ? $this->dateToString($proposal->getUpdatedAt()) : null,
            'author' => $authorName,
            'author_id' => $authorId,
            'author_email' => $authorEmail,
            'user_type' => $authorType,
            'trashed' => $this->booleanToString(!$proposal->isPublished()),
            'trashed_date' => $this->dateToString($proposal->getTrashedAt()),
            'trashed_reason' => $proposal->getTrashedReason(),
            'theme' => $proposal->getTheme() ? $proposal->getTheme()->getTitle() : '',
            'district' => $proposal->getDistrict() ? $proposal->getDistrict()->getName() : '',
            'status' => $proposal->getStatus() ? $proposal->getStatus()->getName() : '',
            'estimation' => $proposal->getEstimation() ? $proposal->getEstimation().' €' : '',
            'answer' => $proposal->getAnswer() ? $this->getProposalAnswer($proposal->getAnswer()) : '',
            'nbVotes' => $proposal->getVotesCount() ? $proposal->getVotesCount() : 0,
        ];
    }

    private function getProposalVoteItem(ProposalVote $vote)
    {
        $proposal = $vote->getProposal();
        $na = $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle');
        $author = $vote->getUser();
        $authorName = $author ? $author->getUsername() : $vote->getUsername();
        $authorId = $author ? $author->getId() : $na;
        $authorType = $author && $author->getUserType() ? $author->getUserType()->getName() : $na;
        $authorEmail = $author ? $author->getEmail() : $vote->getEmail();

        return $item = [
            'id' => $vote->getId(),
            'title' => $proposal->getTitle(),
            'content_type' => $this->translator->trans('project_download.values.content_type.vote', [], 'CapcoAppBundle'),
            'content' => $na,
            'link' => $this->urlResolver->getObjectUrl($proposal, true),
            'created' => $this->dateToString($vote->getCreatedAt()),
            'updated' => $na,
            'author' => $authorName,
            'author_id' => $authorId,
            'author_email' => $authorEmail,
            'user_type' => $authorType,
            'trashed' => $this->booleanToString(!$proposal->isPublished()),
            'trashed_date' => $na,
            'trashed_reason' => $na,
            'theme' => $proposal->getTheme() ? $proposal->getTheme()->getTitle() : '',
            'district' => $proposal->getDistrict() ? $proposal->getDistrict()->getName() : '',
            'status' => $na,
            'estimation' => $na,
            'answer' => $na,
            'nbVotes' => $na,
        ];
    }

    private function getOpinionItem(Opinion $opinion)
    {
        $na = $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle');
        $author = $opinion->getAuthor();
        $authorName = $author ? $author->getUsername() : $this->translator->trans('project_download.values.user_removed', [], 'CapcoAppBundle');
        $authorId = $author ? $author->getId() : $na;
        $authorType = $author && $author->getUserType() ? $author->getUserType()->getName() : $na;

        return $item = [
            'id' => $opinion->getId(),
            'title' => $opinion->getTitle(),
            'content_type' => $this->translator->trans('project_download.values.content_type.opinion', [], 'CapcoAppBundle'),
            'related_object' => $na,
            'category' => $this->getOpinionParents($opinion),
            'content' => $this->getOpinionContent($opinion),
            'link' => $na,
            'created' => $this->dateToString($opinion->getCreatedAt()),
            'updated' => $opinion->getUpdatedAt() != $opinion->getCreatedAt() ? $this->dateToString($opinion->getUpdatedAt()) : null,
            'author' => $authorName,
            'author_id' => $authorId,
            'user_type' => $authorType,
            'score' => $this->calculateScore($opinion->getVotesCountOk(), $opinion->getVotesCountMitige(), $opinion->getVotesCountNok()),
            'total_votes' => $opinion->getVotesCountAll(),
            'votes_ok' => $opinion->getVotesCountOk(),
            'votes_mitigated' => $opinion->getVotesCountMitige(),
            'votes_nok' => $opinion->getVotesCountNok(),
            'sources' => $opinion->getSourcesCount(),
            'total_arguments' => $opinion->getArgumentsCount(),
            'arguments_ok' => $opinion->getArgumentsCountByType('yes'),
            'arguments_nok' => $opinion->getArgumentsCountByType('no'),
            'trashed' => $this->booleanToString(!$opinion->isPublished()),
            'trashed_date' => $this->dateToString($opinion->getTrashedAt()),
            'trashed_reason' => $opinion->getTrashedReason(),
        ];
    }

    private function getOpinionVersionItem(OpinionVersion $version)
    {
        $opinion = $version->getParent();
        $na = $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle');
        $author = $version->getAuthor();
        $authorName = $author ? $author->getUsername() : $this->translator->trans('project_download.values.user_removed', [], 'CapcoAppBundle');
        $authorId = $author ? $author->getId() : $na;
        $authorType = $author && $author->getUserType() ? $author->getUserType()->getName() : $na;

        return $item = [
            'id' => $version->getId(),
            'title' => $version->getTitle(),
            'content_type' => $this->translator->trans('project_download.values.content_type.version', [], 'CapcoAppBundle'),
            'related_object' => $this->translator->trans('project_download.values.related.opinion', ['%id%' => $opinion->getId()], 'CapcoAppBundle'),
            'category' => $this->getOpinionParents($opinion),
            'content' => $this->formatText($version->getBody()),
            'link' => $na,
            'created' => $this->dateToString($version->getCreatedAt()),
            'updated' => $version->getUpdatedAt() != $version->getCreatedAt() ? $this->dateToString($version->getUpdatedAt()) : null,
            'author' => $authorName,
            'author_id' => $authorId,
            'user_type' => $authorType,
            'score' => $this->calculateScore($version->getVotesCountOk(), $version->getVotesCountMitige(), $opinion->getVotesCountNok()),
            'total_votes' => $version->getVotesCountAll(),
            'votes_ok' => $version->getVotesCountOk(),
            'votes_mitigated' => $version->getVotesCountMitige(),
            'votes_nok' => $version->getVotesCountNok(),
            'sources' => $version->getSourcesCount(),
            'total_arguments' => $version->getArgumentsCount(),
            'arguments_ok' => $version->getArgumentsCountByType('yes'),
            'arguments_nok' => $version->getArgumentsCountByType('no'),
            'trashed' => $this->booleanToString(!$version->isPublished()),
            'trashed_date' => $this->dateToString($version->getTrashedAt()),
            'trashed_reason' => $version->getTrashedReason(),
        ];
    }

    private function getArgumentItem(Argument $argument)
    {
        $parent = $argument->getOpinion() ? $argument->getOpinion() : $argument->getOpinionVersion();
        $na = $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle');
        $contentType = $parent->getCommentSystem() === OpinionType::COMMENT_SYSTEM_OK
            ? $this->translator->trans('project_download.values.content_type.simple_argument', [], 'CapcoAppBundle')
            : $this->translator->trans('project_download.values.content_type.argument', [], 'CapcoAppBundle')
        ;
        $category = $parent->getCommentSystem() === OpinionType::COMMENT_SYSTEM_OK
            ? $na
            : $this->translator->trans(Argument::$argumentTypesLabels[$argument->getType()], [], 'CapcoAppBundle')
        ;
        $relatedObject = $argument->getOpinionVersion()
            ? $this->translator->trans('project_download.values.related.version', ['%id%' => $parent->getId()], 'CapcoAppBundle')
            : $this->translator->trans('project_download.values.related.opinion', ['%id%' => $parent->getId()], 'CapcoAppBundle')
        ;
        $author = $argument->getAuthor();
        $authorName = $author ? $author->getUsername() : $this->translator->trans('project_download.values.user_removed', [], 'CapcoAppBundle');
        $authorId = $author ? $author->getId() : $na;
        $authorType = $author && $author->getUserType() ? $author->getUserType()->getName() : $na;
        $item = [
            'id' => $argument->getId(),
            'title' => $na,
            'content_type' => $contentType,
            'category' => $category,
            'related_object' => $relatedObject,
            'content' => $this->formatText($argument->getBody()),
            'link' => $na,
            'created' => $this->dateToString($argument->getCreatedAt()),
            'updated' => $argument->getUpdatedAt() != $argument->getCreatedAt() ? $this->dateToString($argument->getUpdatedAt()) : null,
            'author' => $authorName,
            'author_id' => $authorId,
            'user_type' => $authorType,
            'score' => $this->calculateScore($argument->getVotesCount(), 0, 0),
            'total_votes' => $argument->getVotesCount(),
            'votes_ok' => $argument->getVotesCount(),
            'votes_mitigated' => $na,
            'votes_nok' => $na,
            'sources' => $na,
            'total_arguments' => $na,
            'arguments_ok' => $na,
            'arguments_nok' => $na,
            'trashed' => $this->booleanToString(!$argument->isPublished()),
            'trashed_date' => $this->dateToString($argument->getTrashedAt()),
            'trashed_reason' => $argument->getTrashedReason(),
        ];

        return $item;
    }

    private function getSourceItem(Source $source)
    {
        $parent = $source->getOpinion() ? $source->getOpinion() : $source->getOpinionVersion();
        $relatedObject = $source->getOpinionVersion()
            ? $this->translator->trans('project_download.values.related.version', ['%id%' => $parent->getId()], 'CapcoAppBundle')
            : $this->translator->trans('project_download.values.related.opinion', ['%id%' => $parent->getId()], 'CapcoAppBundle')
        ;
        $na = $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle');
        $author = $source->getAuthor();
        $authorName = $author ? $author->getUsername() : $this->translator->trans('project_download.values.user_removed', [], 'CapcoAppBundle');
        $authorId = $author ? $author->getId() : $na;
        $authorType = $author && $author->getUserType() ? $author->getUserType()->getName() : $na;

        return $item = [
            'id' => $source->getId(),
            'title' => $source->getTitle(),
            'content_type' => $this->translator->trans('project_download.values.content_type.source', [], 'CapcoAppBundle'),
            'category' => $source->getCategory(),
            'related_object' => $relatedObject,
            'content' => $this->formatText($source->getBody()),
            'link' => $this->getSourceLink($source),
            'created' => $this->dateToString($source->getCreatedAt()),
            'updated' => $source->getUpdatedAt() != $source->getCreatedAt() ? $this->dateToString($source->getUpdatedAt()) : null,
            'author' => $authorName,
            'author_id' => $authorId,
            'user_type' => $authorType,
            'score' => $this->calculateScore($source->getVotesCount(), 0, 0),
            'total_votes' => $source->getVotesCount(),
            'votes_ok' => $source->getVotesCount(),
            'votes_mitigated' => $na,
            'votes_nok' => $na,
            'sources' => $na,
            'total_arguments' => $na,
            'arguments_ok' => $na,
            'arguments_nok' => $na,
            'trashed' => $this->booleanToString(!$source->isPublished()),
            'trashed_date' => $this->dateToString($source->getTrashedAt()),
            'trashed_reason' => $source->getTrashedReason(),
        ];
    }

    private function getVoteItem($vote)
    {
        $na = $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle');
        $author = $vote->getUser();
        $authorName = $author ? $author->getUsername() : $this->translator->trans('project_download.values.user_removed', [], 'CapcoAppBundle');
        $authorId = $author ? $author->getId() : $na;
        $authorType = $author && $author->getUserType() ? $author->getUserType()->getName() : $na;

        return $item = [
            'id' => '',
            'title' => $na,
            'content_type' => $this->translator->trans('project_download.values.content_type.vote', [], 'CapcoAppBundle'),
            'related_object' => $this->getVoteObject($vote),
            'category' => $this->getVoteValue($vote),
            'content' => $na,
            'link' => $na,
            'created' => $this->dateToString($vote->getUpdatedAt()),
            'updated' => $na,
            'author' => $authorName,
            'author_id' => $authorId,
            'user_type' => $authorType,
            'score' => $na,
            'total_votes' => $na,
            'votes_ok' => $na,
            'votes_mitigated' => $na,
            'votes_nok' => $na,
            'sources' => $na,
            'total_arguments' => $na,
            'arguments_ok' => $na,
            'arguments_nok' => $na,
            'trashed' => $this->booleanToString(!$vote->getRelatedEntity()->isPublished()),
            'trashed_date' => $na,
            'trashed_reason' => $na,
        ];
    }

    private function getReplyItem(Reply $reply)
    {
        $item = [
            'id' => $reply->getId(),
            'author' => $reply->getAuthor()->getUsername(),
            'phone' => $reply->getAuthor()->getPhone() ? $reply->getAuthor()->getPhone() : '',
            'created' => $this->dateToString($reply->getCreatedAt()),
            'anonymous' => $this->booleanToString($reply->isPrivate()),
        ];

        foreach ($reply->getResponses() as $response) {
            $question = $response->getQuestion();
            $item[$question->getTitle()] = $this->getResponseValue($response);
        }

        foreach ($this->headers['published'] as $header) {
            if (is_array($header) && !array_key_exists($header['label'], $item)) {
                $item[$header['label']] = '';
            }
        }

        return $item;
    }

    private function getVoteValue($vote)
    {
        if (method_exists($vote, 'getValue')) {
            if ($vote->getValue() == -1) {
                return $this->translator->trans('project_download.values.votes.nok', [], 'CapcoAppBundle');
            }
            if ($vote->getValue() == 0) {
                return $this->translator->trans('project_download.values.votes.mitige', [], 'CapcoAppBundle');
            }
            if ($vote->getValue() == 1) {
                return $this->translator->trans('project_download.values.votes.ok', [], 'CapcoAppBundle');
            }
        }

        return $this->translator->trans('project_download.values.votes.ok', [], 'CapcoAppBundle');
    }

    private function getVoteObject($vote)
    {
        $object = $vote->getRelatedEntity();
        if ($object instanceof Opinion) {
            return $this->translator->trans('project_download.values.related.opinion', ['%id%' => $object->getId()], 'CapcoAppBundle');
        }
        if ($object instanceof OpinionVersion) {
            return $this->translator->trans('project_download.values.related.version', ['%id%' => $object->getId()], 'CapcoAppBundle');
        }
        if ($object instanceof Argument) {
            return $this->translator->trans('project_download.values.related.argument', ['%id%' => $object->getId()], 'CapcoAppBundle');
        }
        if ($object instanceof Source) {
            return $this->translator->trans('project_download.values.related.source', ['%id%' => $object->getId()], 'CapcoAppBundle');
        }
    }

    private function calculateScore($ok, $mitigated, $nok)
    {
        return $ok - $nok;
    }

    private function getResponseValue(Response $response)
    {
        $originalValue = $response->getValue();
        if (is_array($originalValue)) {
            $values = $originalValue['labels'];
            if (array_key_exists('other', $originalValue) && $originalValue['other']) {
                $values[] = $originalValue['other'];
            }

            return implode('; ', $values);
        }

        return $originalValue;
    }

    private function getOpinionContent(Opinion $opinion)
    {
        $body = $this->formatText(html_entity_decode($opinion->getBody()));
        if (count($opinion->getAppendices()) > 0) {
            $body .= "\n".$this->translator->trans('project_download.values.appendices.title', [], 'CapcoAppBundle');
            foreach ($opinion->getAppendices() as $app) {
                $body .= "\n".$app->getAppendixType()->getTitle().' :';
                $body .= "\n".$this->formatText($app->getBody());
            }
        }

        return $body;
    }

    private function getProposalContent(Proposal $proposal)
    {
        $body = $this->formatText(html_entity_decode($proposal->getBody()));
        foreach ($proposal->getResponses() as $response) {
            $body .= "\n\n".$response->getQuestion()->getTitle().' :';
            $body .= "\n".$this->formatText($response->getValue());
        }

        return $body;
    }

    private function getProposalAnswer(Answer $answer)
    {
        $body = $answer->getTitle();
        $body .= "\n".$answer->getAuthor()->getUsername();
        $body .= "\n\n".$this->formatText(html_entity_decode($answer->getBody()));

        return $body;
    }

    private function getOpinionParents(Opinion $opinion)
    {
        $parents = [$opinion->getOpinionType()->getTitle()];

        $current = $opinion->getOpinionType();
        while ($current->getParent()) {
            $current = $current->getParent();
            $parents[] = $current->getTitle();
        }

        return implode(' - ', array_reverse($parents));
    }

    private function getSourceLink($source)
    {
        if (null != $source->getLink()) {
            return $source->getLink();
        }
        if (null != $source->getMedia()) {
            return $this->translator->trans('project_download.values.link.media', [], 'CapcoAppBundle');
        }

        return '';
    }

    private function booleanToString($boolean)
    {
        if ($boolean) {
            return $this->translator->trans('project_download.values.yes', [], 'CapcoAppBundle');
        }

        return $this->translator->trans('project_download.values.no', [], 'CapcoAppBundle');
    }

    private function dateToString($date)
    {
        if ($date != null) {
            return $date->format('Y-m-d H:i:s');
        }

        return '';
    }

    private function formatText($text)
    {
        $oneBreak = ['<br>', '<br/>', '&nbsp;'];
        $twoBreaks = ['</p>'];
        $text = str_ireplace($oneBreak, "\r", $text);
        $text = str_ireplace($twoBreaks, "\r\n", $text);
        $text = strip_tags($text);
        $text = html_entity_decode($text, ENT_QUOTES);

        return $text;
    }
}
