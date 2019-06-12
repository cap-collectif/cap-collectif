<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\GraphQL\Resolver\Step\StepUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\UserResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Project\QuestionnaireAcknowledgeReplyMessage;
use Capco\AppBundle\Mailer\Message\Questionnaire\QuestionnaireReplyAdminMessage;
use Capco\AppBundle\SiteParameter\Resolver;
use Symfony\Component\Routing\RouterInterface;

class QuestionnaireReplyNotifier extends BaseNotifier
{
    public const QUESTIONNAIRE_REPLY_CREATE_STATE = 'create';
    public const QUESTIONNAIRE_REPLY_UPDATE_STATE = 'update';
    public const QUESTIONNAIRE_REPLY_DELETE_STATE = 'delete';

    private $baseUrl;
    private $router;
    private $stepUrlResolver;

    public function __construct(
        MailerService $mailer,
        Resolver $siteParams,
        RouterInterface $router,
        UserResolver $userResolver,
        StepUrlResolver $stepUrlResolver
    ) {
        $this->router = $router;
        $this->baseUrl = $this->router->generate('app_homepage', [], RouterInterface::ABSOLUTE_URL);
        $this->stepUrlResolver = $stepUrlResolver;
        parent::__construct($mailer, $siteParams, $userResolver);
    }

    public function onCreate(Reply $reply): void
    {
        $questionnaire = $reply->getQuestionnaire();
        $step = $questionnaire->getStep();

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
                    $step->getProject()->getTitle(),
                    $questionnaire->getTitle(),
                    $reply->getAuthor()->getUsername(),
                    $reply->getUpdatedAt(),
                    $this->siteParams->getValue('global.site.fullname'),
                    self::QUESTIONNAIRE_REPLY_CREATE_STATE,
                    $userUrl,
                    $configUrl,
                    $this->baseUrl,
                    $replyShowUrl
                )
            );
        }

        if ($questionnaire->isAcknowledgeReplies()) {
            $this->mailer->sendMessage(
                QuestionnaireAcknowledgeReplyMessage::create(
                    $reply->getAuthor()->getEmail(),
                    $reply,
                    $step->getProject()->getTitle(),
                    $reply->getUpdatedAt(),
                    $this->siteParams->getValue('global.site.fullname'),
                    self::QUESTIONNAIRE_REPLY_CREATE_STATE,
                    $userUrl,
                    $configUrl,
                    $this->baseUrl,
                    $this->stepUrlResolver->__invoke($step),
                    $questionnaire->getTitle()
                )
            );
        }
    }

    public function onUpdate(Reply $reply): bool
    {
        $questionnaire = $reply->getQuestionnaire();
        $step = $questionnaire->getStep();

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
                    $step->getProject()->getTitle(),
                    $questionnaire->getTitle(),
                    $reply->getAuthor()->getUsername(),
                    $reply->getUpdatedAt(),
                    $this->siteParams->getValue('global.site.fullname'),
                    self::QUESTIONNAIRE_REPLY_UPDATE_STATE,
                    $userUrl,
                    $configUrl,
                    $this->baseUrl,
                    $replyShowUrl
                )
            );
        }
        if ($questionnaire->isAcknowledgeReplies()) {
            $this->mailer->sendMessage(
                QuestionnaireAcknowledgeReplyMessage::create(
                    $reply->getAuthor()->getEmail(),
                    $reply,
                    $step->getProject()->getTitle(),
                    $reply->getUpdatedAt(),
                    $this->siteParams->getValue('global.site.fullname'),
                    self::QUESTIONNAIRE_REPLY_UPDATE_STATE,
                    $userUrl,
                    $configUrl,
                    $this->baseUrl,
                    $this->stepUrlResolver->__invoke($step),
                    $questionnaire->getTitle()
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
     *                     'questionnaire_title' => string,
     *                     'author_name' => string,
     *                     ]
     *
     * @return bool
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

        $this->mailer->sendMessage(
            QuestionnaireReplyAdminMessage::createFromDeletedReply(
                $this->siteParams->getValue('admin.mail.notifications.receive_address'),
                $reply,
                $reply['project_title'],
                $reply['questionnaire_title'],
                $reply['author_name'],
                $reply['deleted_at'],
                $this->siteParams->getValue('global.site.fullname'),
                self::QUESTIONNAIRE_REPLY_DELETE_STATE,
                $userUrl,
                $configUrl,
                $this->baseUrl
            )
        );
    }
}
