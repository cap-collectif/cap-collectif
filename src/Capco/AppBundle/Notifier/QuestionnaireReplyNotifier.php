<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\GraphQL\Resolver\UserResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Questionnaire\QuestionnaireReplyAdminMessage;
use Capco\AppBundle\SiteParameter\Resolver;
use Symfony\Component\Routing\RouterInterface;

class QuestionnaireReplyNotifier extends BaseNotifier
{
    private $router;

    public function __construct(
        MailerService $mailer,
        Resolver $siteParams,
        UserResolver $userResolver,
        RouterInterface $router
    ) {
        parent::__construct($mailer, $siteParams, $userResolver);
        $this->router = $router;
    }

    public function onCreation(Reply $reply, string $stepUrl)
    {
        $questionnaire = $reply->getQuestionnaire();
        $step = $questionnaire->getStep();

        $this->mailer->sendMessage(
            QuestionnaireReplyAdminMessage::create(
                $reply,
                $step->getProject()->getTitle(),
                $questionnaire->getTitle(),
                $reply->getAuthor()->getUsername(),
                $reply->getUpdatedAt(),
                $this->siteParams->getValue('global.site.fullname'),
                $this->router,
                'create',
                $stepUrl
            )
        );
    }

    public function onUpdate(Reply $reply, string $stepUrl)
    {
        $questionnaire = $reply->getQuestionnaire();
        $step = $questionnaire->getStep();

        $this->mailer->sendMessage(
            QuestionnaireReplyAdminMessage::create(
                $reply,
                $step->getProject()->getTitle(),
                $questionnaire->getTitle(),
                $reply->getAuthor()->getUsername(),
                $reply->getUpdatedAt(),
                $this->siteParams->getValue('global.site.fullname'),
                $this->router,
                'update',
                $stepUrl
            )
        );
    }

    public function onDelete(Reply $reply)
    {
        $questionnaire = $reply->getQuestionnaire();
        $step = $questionnaire->getStep();

        $this->mailer->sendMessage(
            QuestionnaireReplyAdminMessage::create(
                $reply,
                $step->getProject()->getTitle(),
                $questionnaire->getTitle(),
                $reply->getAuthor()->getUsername(),
                $reply->getUpdatedAt(),
                $this->siteParams->getValue('global.site.fullname'),
                $this->router,
                'delete'
            )
        );
    }
}
