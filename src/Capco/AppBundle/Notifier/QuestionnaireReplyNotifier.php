<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\GraphQL\Resolver\Step\StepUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\UserResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Project\QuestionnaireAcknowledgeReplyMessage;
use Capco\AppBundle\Mailer\Message\Questionnaire\QuestionnaireReplyAdminMessage;
use Capco\AppBundle\SiteParameter\Resolver;
use Capco\AppBundle\Traits\FormatDateTrait;
use Psr\Log\LoggerInterface;
use Symfony\Component\Routing\RouterInterface;

class QuestionnaireReplyNotifier extends BaseNotifier
{
    public const QUESTIONNAIRE_REPLY_CREATE_STATE = 'create';
    public const QUESTIONNAIRE_REPLY_UPDATE_STATE = 'update';
    public const QUESTIONNAIRE_REPLY_DELETE_STATE = 'delete';

    private $stepUrlResolver;
    private $logger;

    use FormatDateTrait;

    public function __construct(
        MailerService $mailer,
        Resolver $siteParams,
        RouterInterface $router,
        UserResolver $userResolver,
        StepUrlResolver $stepUrlResolver,
        LoggerInterface $logger
    ) {
        $this->stepUrlResolver = $stepUrlResolver;
        $this->logger = $logger;
        parent::__construct($mailer, $siteParams, $userResolver, $router);
    }

    public function onCreate(Reply $reply): void
    {
        if (!$this->isValidReply($reply)) {
            return;
        }
        $questionnaire = $reply->getQuestionnaire();
        $questionnaireStep = $questionnaire->getStep();
        if (!$reply->getPublishedAt()) {
            $this->logger->error(
                __METHOD__.' bad reply',
                ['cause' => sprintf('Replys %s dont have published date', $reply->getId())]
            );

            return;
        }

        $userUrl = $this->router->generate(
            'capco_user_profile_show_all',
            ['slug' => $reply->getAuthor()->getSlug()],
            RouterInterface::ABSOLUTE_URL
        );
        $configUrl = $this->router->generate(
            'admin_capco_app_questionnaire_edit',
            ['id' => $questionnaire->getId()],
            RouterInterface::ABSOLUTE_URL
        );
        $replyShowUrl = $this->router->generate(
            'admin_capco_app_reply_show',
            ['id' => $reply->getId()],
            RouterInterface::ABSOLUTE_URL
        );

        if ($questionnaire->isNotifyResponseCreate()) {
            $this->mailer->sendMessage(
                QuestionnaireReplyAdminMessage::create(
                    $this->siteParams->getValue('admin.mail.notifications.receive_address'),
                    $reply,
                    $questionnaireStep->getProject()->getTitle(),
                    $questionnaire->getStep()->getTitle(),
                    $reply->getAuthor()->getUsername(),
                    $this->siteParams->getValue('global.site.fullname'),
                    self::QUESTIONNAIRE_REPLY_CREATE_STATE,
                    $userUrl,
                    $configUrl,
                    $this->baseUrl,
                    [
                        'date' => $reply->getLongDate(
                            $reply->getPublishedAt(),
                            $this->siteParams->getValue('global.local'),
                            $this->siteParams->getValue('global.timezone')
                        ),
                        'time' => $reply->getTime($reply->getPublishedAt()),
                        'endDate' => $reply->getLongDate(
                            $reply->getStep()->getEndAt(),
                            $this->siteParams->getValue('global.local'),
                            $this->siteParams->getValue('global.timezone')
                        ),
                    ],
                    $replyShowUrl
                )
            );
        }

        if ($questionnaire->isAcknowledgeReplies()) {
            $this->mailer->sendMessage(
                QuestionnaireAcknowledgeReplyMessage::create(
                    $reply->getAuthor()->getEmail(),
                    $reply,
                    $questionnaireStep->getProject()->getTitle(),
                    $this->siteParams->getValue('global.site.fullname'),
                    self::QUESTIONNAIRE_REPLY_CREATE_STATE,
                    $userUrl,
                    $configUrl,
                    $this->baseUrl,
                    $this->stepUrlResolver->__invoke($questionnaireStep),
                    $questionnaire->getStep() ? $questionnaire->getStep()->getTitle() : '',
                    [
                        'date' => $this->getLongDate(
                            $reply->getPublishedAt(),
                            $this->siteParams->getValue('global.local'),
                            $this->siteParams->getValue('global.timezone')
                        ),
                        'time' => $this->getTime($reply->getPublishedAt()),
                        'endDate' => $this->getLongDate(
                            $reply->getStep()->getEndAt(),
                            $this->siteParams->getValue('global.local'),
                            $this->siteParams->getValue('global.timezone')
                        ),
                    ]
                )
            );
        }
    }

    public function onUpdate(Reply $reply): void
    {
        if (!$this->isValidReply($reply)) {
            return;
        }

        $questionnaire = $reply->getQuestionnaire();
        $questionnaireStep = $questionnaire->getStep();

        if (!$reply->getUpdatedAt()) {
            $this->logger->error(
                __METHOD__.' bad reply',
                ['cause' => sprintf('Replys %s dont have updated date', $reply->getId())]
            );

            return;
        }

        $userUrl = $this->router->generate(
            'capco_user_profile_show_all',
            ['slug' => $reply->getAuthor()->getSlug()],
            RouterInterface::ABSOLUTE_URL
        );
        $configUrl = $this->router->generate(
            'admin_capco_app_questionnaire_edit',
            ['id' => $questionnaire->getId()],
            RouterInterface::ABSOLUTE_URL
        );
        $replyShowUrl = $this->router->generate(
            'admin_capco_app_reply_show',
            ['id' => $reply->getId()],
            RouterInterface::ABSOLUTE_URL
        );

        if ($questionnaire->isNotifyResponseUpdate()) {
            $this->mailer->sendMessage(
                QuestionnaireReplyAdminMessage::create(
                    $this->siteParams->getValue('admin.mail.notifications.receive_address'),
                    $reply,
                    $questionnaireStep->getProject()->getTitle(),
                    $questionnaireStep->getTitle(),
                    $reply->getAuthor()->getUsername(),
                    $this->siteParams->getValue('global.site.fullname'),
                    self::QUESTIONNAIRE_REPLY_UPDATE_STATE,
                    $userUrl,
                    $configUrl,
                    $this->baseUrl,
                    [
                        'date' => $this->getLongDate(
                            $reply->getUpdatedAt(),
                            $this->siteParams->getValue('global.local'),
                            $this->siteParams->getValue('global.timezone')
                        ),
                        'time' => $this->getTime($reply->getUpdatedAt()),
                        'endDate' => $this->getLongDate(
                            $reply->getStep()->getEndAt(),
                            $this->siteParams->getValue('global.local'),
                            $this->siteParams->getValue('global.timezone')
                        ),
                    ],
                    $replyShowUrl
                )
            );
        }
        if ($questionnaire->isAcknowledgeReplies()) {
            $this->mailer->sendMessage(
                QuestionnaireAcknowledgeReplyMessage::create(
                    $reply->getAuthor()->getEmail(),
                    $reply,
                    $questionnaireStep->getProject()->getTitle(),
                    $this->siteParams->getValue('global.site.fullname'),
                    self::QUESTIONNAIRE_REPLY_UPDATE_STATE,
                    $userUrl,
                    $configUrl,
                    $this->baseUrl,
                    $this->stepUrlResolver->__invoke($questionnaireStep),
                    $questionnaireStep->getTitle(),
                    [
                        'date' => $this->getLongDate(
                            $reply->getUpdatedAt(),
                            $this->siteParams->getValue('global.local'),
                            $this->siteParams->getValue('global.timezone')
                        ),
                        'time' => $this->getTime($reply->getUpdatedAt()),
                        'endDate' => $this->getLongDate(
                            $reply->getStep()->getEndAt(),
                            $this->siteParams->getValue('global.local'),
                            $this->siteParams->getValue('global.timezone')
                        ),
                    ]
                )
            );
        }
    }

    /**
     * @param array $reply
     *                     The reply is an array because a Reply entity doesn't have soft delete
     *                     The array looks like this :
     *                     [
     *                     'author_slug' => string,
     *                     'questionnaire_id' => string,
     *                     'project_title' => string,
     *                     'deleted_at' => string, which will be transformed into a \DateTimeInterface
     *                     'questionnaire_step_title' => string,
     *                     'author_name' => string,
     *                     ]
     *
     * @throws \Exception
     */
    public function onDelete(array $reply): bool
    {
        $userUrl = $this->router->generate(
            'capco_user_profile_show_all',
            ['slug' => $reply['author_slug']],
            RouterInterface::ABSOLUTE_URL
        );
        $configUrl = $this->router->generate(
            'admin_capco_app_questionnaire_edit',
            ['id' => $reply['questionnaire_id']],
            RouterInterface::ABSOLUTE_URL
        );
        $date = \DateTimeImmutable::createFromFormat('Y-m-d H:i:s', $reply['deleted_at']);

        return $this->mailer->sendMessage(
            QuestionnaireReplyAdminMessage::createFromDeletedReply(
                $this->siteParams->getValue('admin.mail.notifications.receive_address'),
                $reply,
                $reply['project_title'],
                $reply['questionnaire_step_title'],
                $reply['author_name'],
                $this->siteParams->getValue('global.site.fullname'),
                self::QUESTIONNAIRE_REPLY_DELETE_STATE,
                $userUrl,
                $configUrl,
                $this->baseUrl,
                [
                    'date' => $this->getLongDate(
                        $date,
                        $this->siteParams->getValue('global.local'),
                        $this->siteParams->getValue('global.timezone')
                    ),
                    'time' => $this->getTime($date),
                ]
            )
        );
    }

    private function isValidReply(Reply $reply): bool
    {
        $questionnaire = $reply->getQuestionnaire();
        if (!$questionnaire) {
            $this->logger->error(
                __METHOD__.' bad survey',
                ['cause' => sprintf('survey %s dont have questionnaire', $questionnaire->getId())]
            );

            return false;
        }
        $questionnaireStep = $questionnaire->getStep();
        if (!$questionnaireStep) {
            $this->logger->error(
                __METHOD__.' bad survey',
                ['cause' => sprintf('survey %s dont have step', $questionnaire->getId())]
            );

            return false;
        }
        if (!$reply->getStep()) {
            $this->logger->error(
                __METHOD__.' bad reply',
                ['cause' => sprintf('reply %s dont have step', $reply->getId())]
            );

            return false;
        }

        return true;
    }
}
