<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Helper\EnvHelper;
use Capco\AppBundle\Utils\Map;
use Doctrine\ORM\EntityManager;
use Liuggio\ExcelBundle\Factory;
use Sonata\MediaBundle\Twig\Extension\MediaExtension;
use Symfony\Bridge\Twig\Extension\HttpFoundationExtension;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Translation\TranslatorInterface;

class ProjectDownloadResolver
{
    protected static $collectHeaders = [
        'reference',
        'title',
        'summary',
        'author',
        'author_id',
        'user_type',
        'created',
        'updated',
        'expired',
        'trashed',
        'trashed_date',
        'trashed_reason',
        'link',
        'status',
        'estimation',
        'likers',
        'votesCountByStepId',
        'category',
        'theme',
        'address',
        'district',
        'content',
        'media',
    ];

    protected $em;
    protected $translator;
    protected $urlArrayResolver;
    protected $phpexcel;
    protected $headers;
    protected $data;
    protected $instanceName;
    protected $withVote;
    protected $mediaExtension;
    protected $customFields;
    protected $httpFoundExtension;

    public function __construct(
        EntityManager $em,
        TranslatorInterface $translator,
        UrlArrayResolver $urlArrayResolver,
        Factory $phpexcel,
        MediaExtension $mediaExtension,
        HttpFoundationExtension $httpFoundationExtension
    ) {
        $this->em = $em;
        $this->translator = $translator;
        $this->urlArrayResolver = $urlArrayResolver;
        $this->phpexcel = $phpexcel;
        $this->headers = [];
        $this->data = [];
        $this->instanceName = EnvHelper::get('SYMFONY_INSTANCE_NAME');
        $this->mediaExtension = $mediaExtension;
        $this->httpFoundExtension = $httpFoundationExtension;
    }

    public function getQuestionnaireStepHeaders(QuestionnaireStep $step)
    {
        $headers = [
            'id',
            'expired',
            'author',
            'author_id',
            'author_email',
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

    public function getContent(AbstractStep $step, bool $withVote = false): \PHPExcel_Writer_IWriter
    {
        if (!$step) {
            throw new NotFoundHttpException('Step not found');
        }

        if ($step instanceof CollectStep) {
            $this->withVote = $withVote;

            if (
                ('rennes' === $this->instanceName || 'rennespreprod' === $this->instanceName)
                && !in_array('servicePilote', self::$collectHeaders, true)
            ) {
                array_push(
                    self::$collectHeaders,
                    'servicePilote',
                    'domaniality',
                    'compatibility',
                    'environmentalImpact',
                    'dimension',
                    'functioningImpact',
                    'evaluation',
                    'delay',
                    'proposedAnswer'
                );
            }
            $this->headers = self::$collectHeaders;
            $this->initCustomFieldsInHeader($step->getProposalForm());
            $data = $this->getCollectStepData($step);
        } elseif ($step instanceof QuestionnaireStep) {
            $this->headers = $this->getQuestionnaireStepHeaders($step);
            $data = $this->getQuestionnaireStepData($step);
        } else {
            throw new \InvalidArgumentException('Step must be of type collect or questionnaire');
        }
        $title = $step->getProject() ? $step->getProject()->getTitle() . '_' : '';
        $title .= $step->getTitle();

        return $this->getWriterFromData($data, $this->headers, $title);
    }

    /*
     * Add item in correct section
     */
    public function addItemToData($item)
    {
        $this->data[] = $item;
    }

    // ********************************** Generate data items **************************************

    public function getCollectStepData(CollectStep $collectStep)
    {
        if (!$collectStep->getProposalForm()) {
            return [];
        }

        $this->data = [];

        $proposals = $this->em
            ->getRepository('CapcoAppBundle:Proposal')
            ->getByProposalForm($collectStep->getProposalForm(), true);

        foreach ($proposals as &$proposal) {
            $proposal['Step'] = $collectStep;
            $proposal['entity_type'] = 'proposal';
            $entity = $this->em
                ->getRepository('CapcoAppBundle:Proposal')
                ->find($proposal['id']);
            $selectionVotesCount = $this->em
                ->getRepository('CapcoAppBundle:ProposalSelectionVote')
                ->getCountsByProposalGroupedByStepsTitle($entity);
            $collectVotesCount = $this->em
                ->getRepository('CapcoAppBundle:ProposalCollectVote')
                ->getCountsByProposalGroupedByStepsTitle($entity);

            $str = '';
            $loop = 1;
            $nbVotes = count($selectionVotesCount) + count($collectVotesCount);
            foreach ($selectionVotesCount as $step => $value) {
                $str .= $step . ' : ' . $value;
                $str .= $loop < $nbVotes ? ', ' : '';
                ++$loop;
            }

            foreach ($collectVotesCount as $step => $value) {
                $str .= $step . ' : ' . $value;
                $str .= $loop < $nbVotes ? ', ' : '';
                ++$loop;
            }

            $proposal['status'] = null !== $entity->lastStatus() ? $entity->lastStatus()->getName() : '';
            $proposal['reference'] = $entity->getFullReference();
            $proposal['votesCountByStepId'] = $this->formatText($str);
            $proposal['media'] = $entity->getMedia();

            $proposal['likers'] = '';
            foreach ($entity->getLikers() as $liker) {
                $separator = '' === $proposal['likers'] ? '' : ', ';
                $proposal['likers'] = $proposal['likers'] . $separator . $liker->getDisplayName();
            }
        }

        unset($proposal);

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
                if ($this->withVote) {
                    $this->getProposalVotesData($proposal['selectionVotes'], $proposal);
                }
            }
        }
    }

    public function getProposalVotesData($votes, $proposal)
    {
        foreach ($votes as $vote) {
            $this->addItemToData($this->getProposalVoteItem($vote, $proposal));
        }
    }

    public function getRepliesData($replies)
    {
        foreach ($replies as $reply) {
            if ($reply['enabled']) {
                $responses = $this->em
                    ->getRepository('CapcoAppBundle:Responses\AbstractResponse')
                    ->getByReplyAsArray($reply['id']);
                $this->addItemToData($this->getReplyItem($reply, $responses));
            }
        }
    }

    // *************************** Generate items *******************************************

    private function getProposalItem(array $proposal)
    {
        $na = $this->translator->trans('global.non_applicable', [], 'CapcoAppBundle');
        $author = $proposal['author'];
        $authorName = $author ? $author['username'] : $this->translator->trans(
            'project_download.values.user_removed',
            [],
            'CapcoAppBundle'
        );
        $authorId = $author ? $author['id'] : $na;
        $authorType = $author && $author['userType'] ? $author['userType']['name'] : $na;

        $media = '';
        if ($proposal['media']) {
            $media = $this->httpFoundExtension->generateAbsoluteUrl($this->mediaExtension->path($proposal['media'], 'proposal'));
        }

        $expired = $proposal['expired'] ? 'yes' : 'no';

        $item = [
            'reference' => $proposal['reference'],
            'title' => $proposal['title'],
            'summary' => $proposal['summary'] ? $proposal['summary'] : '',
            'votesCountByStepId' => $proposal['votesCountByStepId'],
            'author' => $authorName,
            'author_id' => $authorId,
            'user_type' => $authorType,
            'category' => $proposal['category'] ? $proposal['category']['name'] : '',
            'content' => $this->getProposalContent($proposal),
            'link' => $this->urlArrayResolver->getRoute($proposal),
            'created' => $this->dateToString($proposal['createdAt']),
            'updated' => $proposal['updatedAt'] !== $proposal['createdAt'] ? $this->dateToString(
                $proposal['updatedAt']
            ) : null,
            'media' => $media,
            'trashed' => $this->booleanToString(!$proposal['enabled'] || $proposal['isTrashed']),
            'trashed_date' => $this->dateToString($proposal['trashedAt']),
            'trashed_reason' => $proposal['trashedReason'],
            'theme' => $proposal['theme'] ? $proposal['theme']['title'] : '',
            'address' => $proposal['address'] ? Map::decodeAddressFromJson($proposal['address']) : '',
            'district' => $proposal['district'] ? $proposal['district']['name'] : '',
            'status' => $proposal['status'],
            'estimation' => $proposal['estimation'] ? $proposal['estimation'] . ' €' : '',
            'likers' => $proposal['likers'],
            'expired' => $this->translator->trans('global.' . $expired, [], 'CapcoAppBundle'),
        ];

        $item = $this->addCustomsFieldForProposal($proposal, $item);

        if ('rennes' === $this->instanceName || 'rennespreprod' === $this->instanceName) {
            $item['servicePilote'] = $proposal['servicePilote'] ? $this->formatText(html_entity_decode($proposal['servicePilote'])) : '';
            $item['domaniality'] = $proposal['domaniality'] ? $this->formatText(html_entity_decode($proposal['domaniality'])) : '';
            $item['compatibility'] = $proposal['compatibility'] ? $this->formatText(html_entity_decode($proposal['compatibility'])) : '';
            $item['environmentalImpact'] = $proposal['environmentalImpact'] ? $this->formatText(html_entity_decode($proposal['environmentalImpact'])) : '';
            $item['dimension'] = $proposal['dimension'] ? $this->formatText(html_entity_decode($proposal['dimension'])) : '';
            $item['functioningImpact'] = $proposal['functioningImpact'] ? $this->formatText(html_entity_decode($proposal['functioningImpact'])) : '';
            $item['evaluation'] = $proposal['evaluation'] ? $this->formatText(html_entity_decode($proposal['evaluation'])) : '';
            $item['delay'] = $proposal['delay'] ? $this->formatText(html_entity_decode($proposal['delay'])) : '';
            $item['proposedAnswer'] = $proposal['proposedAnswer'] ? $this->formatText(html_entity_decode($proposal['proposedAnswer'])) : '';
        }

        return $item;
    }

    private function getProposalVoteItem(array $vote, array $proposal)
    {
        $na = $this->translator->trans('global.non_applicable', [], 'CapcoAppBundle');
        $author = $vote['user'];
        $authorName = $author ? $author['username'] : $vote['username'];
        $authorId = $author ? $author['id'] : $na;
        $authorType = $author && $author['userType'] ? $author['userType']['name'] : $na;

        $media = '';
        if ($proposal['media']) {
            $media = $this->httpFoundExtension->generateAbsoluteUrl($this->mediaExtension->path($proposal['media'], 'proposal'));
        }

        $expired = $proposal['expired'] ? 'yes' : 'no';

        $item = [
            'reference' => $vote['id'],
            'title' => $proposal['title'],
            'summary' => $proposal['summary'] ? $proposal['summary'] : '',
            'votesCountByStepId' => '',
            'content' => $na,
            'category' => $proposal['category'] ? $proposal['category']['name'] : '',
            'link' => $na,
            'created' => $this->dateToString($vote['createdAt']),
            'updated' => $na,
            'media' => $media,
            'author' => $authorName,
            'author_id' => $authorId,
            'user_type' => $authorType,
            'trashed' => $this->booleanToString(!$proposal['enabled'] || $proposal['isTrashed']),
            'trashed_date' => $na,
            'trashed_reason' => $na,
            'theme' => $proposal['theme'] ? $proposal['theme']['title'] : '',
            'address' => $proposal['address'] ? Map::decodeAddressFromJson($proposal['address']) : '',
            'district' => $proposal['district'] ? $proposal['district']['name'] : '',
            'status' => $na,
            'estimation' => $na,
            'likers' => $proposal['likers'],
            'expired' => $this->translator->trans('global.' . $expired, [], 'CapcoAppBundle'),
        ];

        $item = $this->addCustomsFieldForProposal($proposal, $item);

        if ('rennes' === $this->instanceName || 'rennespreprod' === $this->instanceName) {
            $item['servicePilote'] = $proposal['servicePilote'] ? $this->formatText(html_entity_decode($proposal['servicePilote'])) : '';
            $item['domaniality'] = $proposal['domaniality'] ? $this->formatText(html_entity_decode($proposal['domaniality'])) : '';
            $item['compatibility'] = $proposal['compatibility'] ? $this->formatText(html_entity_decode($proposal['compatibility'])) : '';
            $item['environmentalImpact'] = $proposal['environmentalImpact'] ? $this->formatText(html_entity_decode($proposal['environmentalImpact'])) : '';
            $item['dimension'] = $proposal['dimension'] ? $this->formatText(html_entity_decode($proposal['dimension'])) : '';
            $item['functioningImpact'] = $proposal['functioningImpact'] ? $this->formatText(html_entity_decode($proposal['functioningImpact'])) : '';
            $item['evaluation'] = $proposal['evaluation'] ? $this->formatText(html_entity_decode($proposal['evaluation'])) : '';
            $item['delay'] = $proposal['delay'] ? $this->formatText(html_entity_decode($proposal['delay'])) : '';
            $item['proposedAnswer'] = $proposal['proposedAnswer'] ? $this->formatText(html_entity_decode($proposal['proposedAnswer'])) : '';
        }

        return $item;
    }

    private function getReplyItem(array $reply, array $responses)
    {
        $item = [
            'id' => $reply['id'],
            'expired' => $reply['expired'],
            'author' => $reply['author']['username'],
            'author_id' => $reply['author']['id'],
            'author_email' => $reply['author']['email'],
            'phone' => $reply['author']['phone'] ? (string) $reply['author']['phone'] : '',
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

    private function getProposalContent(array $proposal)
    {
        $body = $this->formatText(html_entity_decode($proposal['body']));
        foreach ($proposal['responses'] as $response) {
            $body .= "\n\n" . $response['question']['title'] . ' :';
            $body .= "\n" . $this->formatText($response['value']);
        }

        return $body;
    }

    private function getWriterFromData($data, $headers, $title)
    {
        $phpExcelObject = $this->phpexcel->createPHPExcelObject();
        $phpExcelObject->getProperties()
            ->setTitle($title);
        $phpExcelObject->setActiveSheetIndex(0);
        $sheet = $phpExcelObject->getActiveSheet();
        $sheet->setTitle($this->translator->trans('project_download.sheet.title', [], 'CapcoAppBundle'));
        \PHPExcel_Settings::setCacheStorageMethod(
            \PHPExcel_CachedObjectStorageFactory::cache_in_memory,
            ['memoryCacheSize' => '512M']
        );
        $nbCols = count($headers);
        // Add headers
        list($startColumn, $startRow) = \PHPExcel_Cell::coordinateFromString('A1');
        $currentColumn = $startColumn;
        foreach ($headers as $header) {
            if (is_array($header)) {
                $header = $header['label'];
            } else {
                if (!in_array($header, $this->customFields, true)) {
                    $header = $this->translator->trans('project_download.label.' . $header, [], 'CapcoAppBundle');
                }
            }
            $sheet->setCellValueExplicit($currentColumn . $startRow, $header);
            ++$currentColumn;
        }
        list($startColumn, $startRow) = \PHPExcel_Cell::coordinateFromString('A2');
        $currentRow = $startRow;
        // Loop through data
        foreach ($data as $row) {
            $currentColumn = $startColumn;
            for ($i = 0; $i < $nbCols; ++$i) {
                $headerKey = is_array($headers[$i]) ? $headers[$i]['label'] : $headers[$i];

                $sheet->setCellValue($currentColumn . $currentRow, $row[$headerKey]);
                ++$currentColumn;
            }
            ++$currentRow;
        }

        // create the writer
        return $this->phpexcel->createWriter($phpExcelObject, 'Excel2007');
    }

    private function initCustomFieldsInHeader(ProposalForm $proposalForm)
    {
        $this->customFields = [];
        foreach ($proposalForm->getQuestions() as $question) {
            $title = $question->getQuestion()->getTitle();
            $this->customFields[] = $title;
        }

        $this->headers = array_merge($this->headers, $this->customFields);
    }

    private function addCustomsFieldForProposal(array $proposal, array $item): array
    {
        foreach ($this->customFields as $customField) {
            $item[$customField] = '';
        }

        foreach ($proposal['responses'] as $response) {
            if (in_array($response['question']['title'], $this->customFields, true)) {
                $item[$response['question']['title']] = (string) $response['value'];
            }
        }

        return $item;
    }

    private function booleanToString($boolean)
    {
        if ($boolean) {
            return $this->translator->trans('project_download.values.yes', [], 'CapcoAppBundle');
        }

        return $this->translator->trans('global.no', [], 'CapcoAppBundle');
    }

    private function dateToString(\DateTime $date = null)
    {
        if ($date) {
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
