<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Answer;
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
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Translation\TranslatorInterface;
use Liuggio\ExcelBundle\Factory;

class ProjectDownloadResolver
{
    protected $consultationHeaders = [
        'id',
        'author',
        'author_id',
        'author_email',
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
    protected $translator;
    protected $urlArrayResolver;
    protected $phpexcel;
    protected $headers;
    protected $data;

    public function __construct(
        EntityManager $em,
        TranslatorInterface $translator,
        UrlArrayResolver $urlArrayResolver,
        Factory $phpexcel
    ) {
        $this->em = $em;
        $this->translator = $translator;
        $this->urlArrayResolver = $urlArrayResolver;
        $this->phpexcel = $phpexcel;
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

    public function getContent(AbstractStep $step): \PHPExcel_Writer_IWriter
    {
        if (null == $step) {
            throw new NotFoundHttpException('Step not found');
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
        $title = $step->getProject() ? $step->getProject()->getTitle().'_' : '';
        $title .= $step->getTitle();

        $writer = $this->getWriterFromData($data, $this->headers, $title);

        return $writer;
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
        $opinions = $this->em->getRepository('CapcoAppBundle:Opinion')->getEnabledByConsultationStep(
            $consultationStep,
            true
        );
        $versions = $this->em->getRepository('CapcoAppBundle:OpinionVersion')->getEnabledByConsultationStep(
            $consultationStep,
            true
        );

        foreach ($opinions as &$opinion) {
            $opinion['Step'] = $consultationStep;
        }

        foreach ($versions as &$version) {
            $version['Step'] = $consultationStep;
        }

        // Create items from data
        $this->getOpinionsData($opinions);
        $this->getVersionsData($versions);

        return $this->data;
    }

    public function getCollectStepData(CollectStep $collectStep)
    {
        $this->data = [];

        // Proposals
        $proposals = $this->em
            ->getRepository('CapcoAppBundle:Proposal')
            ->getEnabledByProposalForm($collectStep->getProposalForm(), true);

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
                ->getEnabledByQuestionnaireAsArray(
                    $questionnaireStep->getQuestionnaire()
                );
        }

        $this->getRepliesData($replies);

        return $this->data;
    }

    public function getProposalsData($proposals)
    {
        foreach ($proposals as $proposal) {
            if ($proposal['enabled']) {
                $this->addItemToData($this->getProposalItem($proposal));
                $this->getProposalVotesData($proposal['votes'], $proposal);
            }
        }
    }

    public function getProposalVotesData($votes, $proposal)
    {
        foreach ($votes as $vote) {
            $this->addItemToData($this->getProposalVoteItem($vote, $proposal));
        }
    }

    public function getOpinionsData($opinions)
    {
        foreach ($opinions as $opinion) {
            if ($opinion['isEnabled']) {
                $opinion['published'] = $opinion['isEnabled'] && !$opinion['isTrashed'];
                $opinion['entity_type'] = 'opinion';
                $this->addItemToData($this->getOpinionItem($opinion));
                $votes = $this->em
                    ->getRepository('CapcoAppBundle:OpinionVote')
                    ->getAllByOpinion($opinion['id'], true);
                $arguments = $this->em
                    ->getRepository('CapcoAppBundle:Argument')
                    ->getAllByOpinion($opinion['id'], true);
                $sources = $this->em
                    ->getRepository('CapcoAppBundle:Source')
                    ->getAllByOpinion($opinion['id'], true);
                $this->getVotesData($votes, $opinion);
                $this->getArgumentsData($arguments, $opinion);
                $this->getSourcesData($sources, $opinion);
            }
        }
    }

    public function getVersionsData($versions)
    {
        foreach ($versions as $version) {
            if ($version['enabled']) {
                $version['published'] = $version['enabled'] && !$version['isTrashed'];
                $version['entity_type'] = 'version';
                $this->addItemToData($this->getOpinionVersionItem($version));
                $votes = $this->em
                    ->getRepository('CapcoAppBundle:OpinionVersionVote')
                    ->getAllByVersion($version['id'], true);
                $arguments = $this->em
                    ->getRepository('CapcoAppBundle:Argument')
                    ->getAllByVersion($version['id'], true);
                $sources = $this->em
                    ->getRepository('CapcoAppBundle:Source')
                    ->getAllByVersion($version['id'], true);
                $this->getVotesData($votes, $version);
                $this->getArgumentsData($arguments, $version);
                $this->getSourcesData($sources, $version);
            }
        }
    }

    public function getArgumentsData($arguments, $parent)
    {
        foreach ($arguments as $argument) {
            if ($argument['isEnabled']) {
                $argument['published'] = $argument['isEnabled'] && !$argument['isTrashed']
                    && ($parent['entity_type'] === 'opinion'
                        ? $parent['isEnabled'] && !$parent['isTrashed']
                        : $parent['enabled'] && !$parent['isTrashed'] && $parent['parent']['isEnabled'] && !$parent['parent']['isTrashed']);
                $argument['entity_type'] = 'argument';
                $this->addItemToData($this->getArgumentItem($argument, $parent));
                $votes = $this->em
                    ->getRepository('CapcoAppBundle:ArgumentVote')
                    ->getAllByArgument($argument['id'], true);
                $this->getVotesData($votes, $argument);
            }
        }
    }

    public function getSourcesData($sources, $parent)
    {
        foreach ($sources as $source) {
            if ($source['isEnabled']) {
                $source['published'] = $source['isEnabled'] && !$source['isTrashed'] &&
                    ($parent['entity_type'] === 'opinion'
                        ? $parent['isEnabled'] && !$parent['isTrashed']
                        : $parent['enabled'] && !$parent['isTrashed'] && $parent['parent']['isEnabled'] && !$parent['parent']['isTrashed']);
                $source['entity_type'] = 'source';
                $this->addItemToData($this->getSourceItem($source, $parent));
                $votes = $this->em
                    ->getRepository('CapcoAppBundle:SourceVote')
                    ->getAllBySource($source['id'], true);
                $this->getVotesData($votes, $source);
            }
        }
    }

    public function getVotesData($votes, $entity)
    {
        foreach ($votes as $vote) {
            $this->addItemToData($this->getVoteItem($vote, $entity));
        }
    }

    public function getRepliesData($replies)
    {
        foreach ($replies as $reply) {
            if ($reply['enabled']) {
                $responses = $this->em
                    ->getRepository('CapcoAppBundle:Response')
                    ->getByReplyAsArray($reply['id']);
                $this->addItemToData($this->getReplyItem($reply, $responses));
            }
        }
    }

    // *************************** Generate items *******************************************

    private function getProposalItem(array $proposal)
    {
        $na = $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle');
        $author = $proposal['author'];
        $authorName = $author ? $author['username'] : $this->translator->trans(
            'project_download.values.user_removed',
            [],
            'CapcoAppBundle'
        );
        $authorId = $author ? $author['id'] : $na;
        $authorType = $author && $author['userType'] ? $author['userType']['name'] : $na;
        $authorEmail = $author ? $author['email'] : $na;

        return $item = [
            'id' => $proposal['id'],
            'title' => $proposal['title'],
            'content_type' => $this->translator->trans(
                'project_download.values.content_type.proposal',
                [],
                'CapcoAppBundle'
            ),
            'content' => $this->getProposalContent($proposal),
            'link' => $na,
            'created' => $this->dateToString($proposal['createdAt']),
            'updated' => $proposal['updatedAt'] != $proposal['createdAt'] ? $this->dateToString(
                $proposal['updatedAt']
            ) : null,
            'author' => $authorName,
            'author_id' => $authorId,
            'author_email' => $authorEmail,
            'user_type' => $authorType,
            'trashed' => $this->booleanToString(!$proposal['enabled'] || $proposal['isTrashed']),
            'trashed_date' => $this->dateToString($proposal['trashedAt']),
            'trashed_reason' => $proposal['trashedReason'],
            'theme' => $proposal['theme'] ? $proposal['theme']['title'] : '',
            'district' => $proposal['district'] ? $proposal['district']['name'] : '',
            'status' => $proposal['status'] ? $proposal['status']['name'] : '',
            'estimation' => $proposal['estimation'] ? $proposal['estimation'].' €' : '',
            'answer' => $proposal['answer'] ? $this->getProposalAnswer($proposal['answer']) : '',
            'nbVotes' => $proposal['votesCount'] ? $proposal['votesCount'] : 0,
        ];
    }

    private function getProposalVoteItem(array $vote, array $proposal)
    {
        $na = $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle');
        $author = $vote['user'];
        $authorName = $author ? $author['username'] : $vote['username'];
        $authorId = $author ? $author['id'] : $na;
        $authorType = $author && $author['userType'] ? $author['userType']['name'] : $na;
        $authorEmail = $author ? $author['email'] : $vote['email'];

        return $item = [
            'id' => $vote['id'],
            'title' => $proposal['title'],
            'content_type' => $this->translator->trans(
                'project_download.values.content_type.vote',
                [],
                'CapcoAppBundle'
            ),
            'content' => $na,
            'link' => $na,
            'created' => $this->dateToString($vote['createdAt']),
            'updated' => $na,
            'author' => $authorName,
            'author_id' => $authorId,
            'author_email' => $authorEmail,
            'user_type' => $authorType,
            'trashed' => $this->booleanToString(!$proposal['enabled'] || $proposal['isTrashed']),
            'trashed_date' => $na,
            'trashed_reason' => $na,
            'theme' => $proposal['theme'] ? $proposal['theme']['title'] : '',
            'district' => $proposal['district'] ? $proposal['district']['name'] : '',
            'status' => $na,
            'estimation' => $na,
            'answer' => $na,
            'nbVotes' => $na,
        ];
    }

    private function getOpinionItem(array $opinion)
    {
        $na = $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle');
        $author = $opinion['Author'];
        $authorName = $author ? $author['username'] : $this->translator->trans(
            'project_download.values.user_removed',
            [],
            'CapcoAppBundle'
        );
        $authorId = $author ? $author['id'] : $na;
        $authorType = $author && $author['userType'] ? $author['userType']['name'] : $na;
        $authorMail = $author['email'] ?? $na;

        return $item = [
            'id' => $opinion['id'],
            'title' => $opinion['title'],
            'content_type' => $this->translator->trans(
                'project_download.values.content_type.opinion',
                [],
                'CapcoAppBundle'
            ),
            'related_object' => $na,
            'category' => $this->getOpinionParents($opinion),
            'content' => $this->getOpinionContent($opinion),
            'link' => $this->urlArrayResolver->getRoute($opinion),
            'created' => $this->dateToString($opinion['createdAt']),
            'updated' => $opinion['updatedAt'] != $opinion['createdAt'] ? $this->dateToString(
                $opinion['updatedAt']
            ) : null,
            'author' => $authorName,
            'author_id' => $authorId,
            'author_email' => $authorMail,
            'user_type' => $authorType,
            'score' => $this->calculateScore(
                $opinion['votesCountOk'],
                $opinion['votesCountMitige'],
                $opinion['votesCountNok']
            ),
            'total_votes' => $opinion['votesCountOk'] + $opinion['votesCountMitige'] + $opinion['votesCountNok'],
            'votes_ok' => $opinion['votesCountOk'],
            'votes_mitigated' => $opinion['votesCountMitige'],
            'votes_nok' => $opinion['votesCountNok'],
            'sources' => $opinion['sourcesCount'],
            'total_arguments' => $opinion['argumentsCount'],
            'arguments_ok' => $this->getArgumentsCountByType('yes', $opinion['arguments']),
            'arguments_nok' => $this->getArgumentsCountByType('no', $opinion['arguments']),
            'trashed' => $this->booleanToString(!$opinion['published']),
            'trashed_date' => $this->dateToString($opinion['trashedAt']),
            'trashed_reason' => $opinion['trashedReason'],
        ];
    }

    private function getOpinionVersionItem(array $version)
    {
        $opinion = $version['parent'];
        $na = $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle');
        $author = $version['author'];
        $authorName = $author ? $author['username'] : $this->translator->trans(
            'project_download.values.user_removed',
            [],
            'CapcoAppBundle'
        );
        $authorId = $author ? $author['id'] : $na;
        $authorType = $author && $author['userType'] ? $author['userType']['name'] : $na;
        $authorMail = $author['email'] ?? $na;

        return $item = [
            'id' => $version['id'],
            'title' => $version['title'],
            'content_type' => $this->translator->trans(
                'project_download.values.content_type.version',
                [],
                'CapcoAppBundle'
            ),
            'related_object' => $this->translator->trans(
                'project_download.values.related.opinion',
                ['%id%' => $opinion['id']],
                'CapcoAppBundle'
            ),
            'category' => $this->getOpinionParents($opinion),
            'content' => $this->formatText($version['body']),
            'link' => $this->urlArrayResolver->getRoute($opinion),
            'created' => $this->dateToString($version['createdAt']),
            'updated' => $version['updatedAt'] != $version['createdAt'] ? $this->dateToString(
                $version['updatedAt']
            ) : null,
            'author' => $authorName,
            'author_id' => $authorId,
            'author_email' => $authorMail,
            'user_type' => $authorType,
            'score' => $this->calculateScore(
                $version['votesCountOk'],
                $version['votesCountMitige'],
                $version['votesCountNok']
            ),
            'total_votes' => $version['votesCountOk'] + $version['votesCountMitige'] + $version['votesCountNok'],
            'votes_ok' => $version['votesCountOk'],
            'votes_mitigated' => $version['votesCountMitige'],
            'votes_nok' => $version['votesCountNok'],
            'sources' => $version['sourcesCount'],
            'total_arguments' => $version['argumentsCount'],
            'arguments_ok' => $this->getArgumentsCountByType('yes', $version['arguments']),
            'arguments_nok' => $this->getArgumentsCountByType('no', $version['arguments']),
            'trashed' => $this->booleanToString(!$version['published']),
            'trashed_date' => $this->dateToString($version['trashedAt']),
            'trashed_reason' => $version['trashedReason'],
        ];
    }

    private function getArgumentItem(array $argument, $parent)
    {
        $opinionType = $parent['entity_type'] === 'opinion' ? $parent['OpinionType'] : $parent['parent']['OpinionType'];
        $na = $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle');
        $contentType = $opinionType['commentSystem'] === OpinionType::COMMENT_SYSTEM_OK
            ? $this->translator->trans('project_download.values.content_type.simple_argument', [], 'CapcoAppBundle')
            : $this->translator->trans('project_download.values.content_type.argument', [], 'CapcoAppBundle');
        $category = $opinionType['commentSystem'] === OpinionType::COMMENT_SYSTEM_OK
            ? $na
            : $this->translator->trans(Argument::$argumentTypesLabels[$argument['type']], [], 'CapcoAppBundle');
        $relatedObject = $parent['entity_type'] === 'version'
            ? $this->translator->trans(
                'project_download.values.related.version',
                ['%id%' => $parent['id']],
                'CapcoAppBundle'
            )
            : $this->translator->trans(
                'project_download.values.related.opinion',
                ['%id%' => $parent['id']],
                'CapcoAppBundle'
            );
        $author = $argument['Author'];
        $authorName = $author ? $author['username'] : $this->translator->trans(
            'project_download.values.user_removed',
            [],
            'CapcoAppBundle'
        );
        $authorId = $author ? $author['id'] : $na;
        $authorType = $author && $author['userType'] ? $author['userType']['name'] : $na;
        $authorMail = $author['email'] ?? $na;

        $item = [
            'id' => $argument['id'],
            'title' => $na,
            'content_type' => $contentType,
            'category' => $category,
            'related_object' => $relatedObject,
            'content' => $this->formatText($argument['body']),
            'link' => $na,
            'created' => $this->dateToString($argument['createdAt']),
            'updated' => $argument['updatedAt'] != $argument['createdAt'] ? $this->dateToString(
                $argument['updatedAt']
            ) : null,
            'author' => $authorName,
            'author_id' => $authorId,
            'author_email' => $authorMail,
            'user_type' => $authorType,
            'score' => $this->calculateScore($argument['votesCount'], 0, 0),
            'total_votes' => $argument['votesCount'],
            'votes_ok' => $argument['votesCount'],
            'votes_mitigated' => $na,
            'votes_nok' => $na,
            'sources' => $na,
            'total_arguments' => $na,
            'arguments_ok' => $na,
            'arguments_nok' => $na,
            'trashed' => $this->booleanToString(!$argument['published']),
            'trashed_date' => $this->dateToString($argument['trashedAt']),
            'trashed_reason' => $argument['trashedReason'],
        ];

        return $item;
    }

    private function getSourceItem(array $source, $parent)
    {
        $relatedObject = $parent['entity_type'] === 'version'
            ? $this->translator->trans(
                'project_download.values.related.version',
                ['%id%' => $parent['id']],
                'CapcoAppBundle'
            )
            : $this->translator->trans(
                'project_download.values.related.opinion',
                ['%id%' => $parent['id']],
                'CapcoAppBundle'
            );
        $na = $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle');
        $author = $source['Author'];
        $authorName = $author ? $author['username'] : $this->translator->trans(
            'project_download.values.user_removed',
            [],
            'CapcoAppBundle'
        );
        $authorId = $author ? $author['id'] : $na;
        $authorType = $author && $author['userType'] ? $author['userType']['name'] : $na;
        $authorMail = $author['email'] ?? $na;

        return $item = [
            'id' => $source['id'],
            'title' => $source['title'],
            'content_type' => $this->translator->trans(
                'project_download.values.content_type.source',
                [],
                'CapcoAppBundle'
            ),
            'category' => $source['Category']['title'],
            'related_object' => $relatedObject,
            'content' => $this->formatText($source['body']),
            'link' => $this->getSourceLink($source),
            'created' => $this->dateToString($source['createdAt']),
            'updated' => $source['updatedAt'] != $source['createdAt'] ? $this->dateToString(
                $source['updatedAt']
            ) : null,
            'author' => $authorName,
            'author_id' => $authorId,
            'author_email' => $authorMail,
            'user_type' => $authorType,
            'score' => $this->calculateScore($source['votesCount'], 0, 0),
            'total_votes' => $source['votesCount'],
            'votes_ok' => $source['votesCount'],
            'votes_mitigated' => $na,
            'votes_nok' => $na,
            'sources' => $na,
            'total_arguments' => $na,
            'arguments_ok' => $na,
            'arguments_nok' => $na,
            'trashed' => $this->booleanToString(!$source['published']),
            'trashed_date' => $this->dateToString($source['trashedAt']),
            'trashed_reason' => $source['trashedReason'],
        ];
    }

    private function getVoteItem($vote, $entity)
    {
        $na = $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle');
        $author = $vote['user'];
        $authorName = $author ? $author['username'] : $this->translator->trans(
            'project_download.values.user_removed',
            [],
            'CapcoAppBundle'
        );
        $authorId = $author ? $author['id'] : $na;
        $authorType = $author && $author['userType'] ? $author['userType']['name'] : $na;
        $authorMail = $author['email'] ?? $na;

        return $item = [
            'id' => '',
            'title' => $na,
            'content_type' => $this->translator->trans(
                'project_download.values.content_type.vote',
                [],
                'CapcoAppBundle'
            ),
            'related_object' => $this->getVoteObject($entity),
            'category' => $this->getVoteValue($vote),
            'content' => $na,
            'link' => $na,
            'created' => $this->dateToString($vote['updatedAt']),
            'updated' => $na,
            'author' => $authorName,
            'author_id' => $authorId,
            'author_email' => $authorMail,
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
            'trashed' => $this->booleanToString(!$entity['published']),
            'trashed_date' => $na,
            'trashed_reason' => $na,
        ];
    }

    private function getReplyItem(array $reply, array $responses)
    {
        $item = [
            'id' => $reply['id'],
            'author' => $reply['author']['username'],
            'phone' => $reply['author']['phone'] ? (string)$reply['author']['phone'] : '',
            'created' => $this->dateToString($reply['createdAt']),
            'anonymous' => $this->booleanToString($reply['private']),
        ];

        foreach ($responses as $response) {
            $question = $response['question'];
            $item[$question['title']] = $this->getResponseValue($response);
        }

        foreach ($this->headers as $header) {
            if (is_array($header) && !array_key_exists($header['label'], $item)) {
                $item[$header['label']] = '';
            }
        }

        return $item;
    }

    public function getArgumentsCountByType($type, $arguments)
    {
        $count = 0;
        foreach ($arguments as $arg) {
            if (Argument::$argumentTypes[$arg['type']] == $type) {
                ++$count;
            }
        }

        return $count;
    }

    private function getVoteValue(array $vote)
    {
        if (array_key_exists('value', $vote)) {
            if ($vote['value'] == -1) {
                return $this->translator->trans('project_download.values.votes.nok', [], 'CapcoAppBundle');
            }
            if ($vote['value'] == 0) {
                return $this->translator->trans('project_download.values.votes.mitige', [], 'CapcoAppBundle');
            }
        }

        return $this->translator->trans('project_download.values.votes.ok', [], 'CapcoAppBundle');
    }

    private function getVoteObject(array $object)
    {
        if ($object['entity_type'] === 'opinion') {
            return $this->translator->trans(
                'project_download.values.related.opinion',
                ['%id%' => $object['id']],
                'CapcoAppBundle'
            );
        }
        if ($object['entity_type'] === 'opinionVersion') {
            return $this->translator->trans(
                'project_download.values.related.version',
                ['%id%' => $object['id']],
                'CapcoAppBundle'
            );
        }
        if ($object['entity_type'] === 'argument') {
            return $this->translator->trans(
                'project_download.values.related.argument',
                ['%id%' => $object['id']],
                'CapcoAppBundle'
            );
        }
        if ($object['entity_type'] === 'source') {
            return $this->translator->trans(
                'project_download.values.related.source',
                ['%id%' => $object['id']],
                'CapcoAppBundle'
            );
        }
    }

    private function calculateScore($ok, $mitigated, $nok)
    {
        return $ok - $nok;
    }

    private function getResponseValue(array $response)
    {
        $originalValue = $response['value'];
        if (is_array($originalValue)) {
            $values = $originalValue['labels'];
            if (array_key_exists('other', $originalValue) && $originalValue['other']) {
                $values[] = $originalValue['other'];
            }

            return implode(';', $values);
        }

        return $originalValue;
    }

    private function getOpinionContent(array $opinion)
    {
        $body = $this->formatText(html_entity_decode($opinion['body']));
        if (count($opinion['appendices']) > 0) {
            $body .= "\n".$this->translator->trans('project_download.values.appendices.title', [], 'CapcoAppBundle');
            foreach ($opinion['appendices'] as $app) {
                $body .= "\n".$app['appendixType']['title'].' :';
                $body .= "\n".$this->formatText($app['body']);
            }
        }

        return $body;
    }

    private function getProposalContent(array $proposal)
    {
        $body = $this->formatText(html_entity_decode($proposal['body']));
        foreach ($proposal['responses'] as $response) {
            $body .= "\n\n".$response['question']['title'].' :';
            $body .= "\n".$this->formatText($response['value']);
        }

        return $body;
    }

    private function getProposalAnswer(array $answer)
    {
        $body = $answer['title'];
        $body .= "\n".$answer['author']['username'];
        $body .= "\n\n".$this->formatText(html_entity_decode($answer['body']));

        return $body;
    }

    private function getOpinionParents(array $opinion)
    {
        $opinionType = $this->em->getRepository('CapcoAppBundle:OpinionType')->find($opinion['OpinionType']['id']);
        $parents = [$opinionType->getTitle()];

        $current = $opinionType;
        while ($current->getParent()) {
            $current = $current->getParent();
            $parents[] = $current->getTitle();
        }

        return implode(' - ', array_reverse($parents));
    }

    private function getSourceLink($source)
    {
        if (null != $source['link']) {
            return $source['link'];
        }
        if (null != $source['media']) {
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

    private function getWriterFromData($data, $headers, $title)
    {
        $phpExcelObject = $this->phpexcel->createPHPExcelObject();
        $phpExcelObject->getProperties()
            ->setTitle($title);
        $phpExcelObject->setActiveSheetIndex(0);
        $sheet = $phpExcelObject->getActiveSheet();
        $sheet->setTitle($this->translator->trans('project_download.sheet.title', [], 'CapcoAppBundle'));
        $nbCols = count($headers);
        // Add headers
        list($startColumn, $startRow) = \PHPExcel_Cell::coordinateFromString('A1');
        $currentColumn = $startColumn;
        foreach ($headers as $header) {
            if (is_array($header)) {
                $header = $header['label'];
            } else {
                $header = $this->translator->trans('project_download.label.'.$header, [], 'CapcoAppBundle');
            }
            $sheet->setCellValueExplicit($currentColumn.$startRow, $header);
            ++$currentColumn;
        }
        list($startColumn, $startRow) = \PHPExcel_Cell::coordinateFromString('A2');
        $currentRow = $startRow;
        // Loop through data
        foreach ($data as $row) {
            $currentColumn = $startColumn;
            for ($i = 0; $i < $nbCols; ++$i) {
                $headerKey = is_array($headers[$i]) ? $headers[$i]['label'] : $headers[$i];
                $sheet->setCellValue($currentColumn.$currentRow, $row[$headerKey]);
                ++$currentColumn;
            }
            ++$currentRow;
        }
        // create the writer
        $writer = $this->phpexcel->createWriter($phpExcelObject, 'Excel5');

        return $writer;
    }
}
