<?php

namespace Capco\AppBundle\GraphQL\Mutation\Mailing;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\EmailingCampaign\AbstractEmailingCampaignMessage;
use Capco\AppBundle\Mailer\Message\EmailingCampaign\TestEmailingCampaignMessage;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\UserBundle\Entity\User;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Symfony\Component\Routing\RouterInterface;
use Twig\Environment;

class TestEmailingCampaignMutation extends AbstractEmailingCampaignMutation
{
    private MailerService $mailerService;
    private SiteParameterResolver $siteParams;
    private RouterInterface $router;
    private Environment $twig;

    public function __construct(
        GlobalIdResolver $resolver,
        MailerService $mailerService,
        SiteParameterResolver $siteParams,
        RouterInterface $router,
        Environment $twig
    ) {
        parent::__construct($resolver);
        $this->mailerService = $mailerService;
        $this->siteParams = $siteParams;
        $this->router = $router;
        $this->twig = $twig;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $error = null;
        $html = null;

        try {
            $testEmail = $this->getTestEmail($input);
            $emailingCampaign = $this->getSendableCampaign($input, $viewer);
            $html = $this->sendEmailAndGetHTML(
                $this->createTestEmail($testEmail, $emailingCampaign)
            );
        } catch (UserError $exception) {
            $html = null;
            $error = $exception->getMessage();
        }

        return compact('html', 'error');
    }

    /**
     * @TODO : add user_locale to localize email
     */
    private function createTestEmail(
        string $testReceipt,
        EmailingCampaign $emailingCampaign
    ): TestEmailingCampaignMessage {
        return new TestEmailingCampaignMessage($testReceipt, $emailingCampaign, [
            'baseUrl' => $this->router->generate('app_homepage'),
            'siteUrl' => $this->router->generate('app_homepage'),
            'siteName' => $this->siteParams->getValue('global.site.fullname'),
            'unsubscribeUrl' => $this->router->generate('app_homepage'),
        ]);
    }

    private function sendEmailAndGetHTML(AbstractEmailingCampaignMessage $message): string
    {
        $this->mailerService->sendMessage($message);
        $context = $message->getTemplateVars();
        $context['user_locale'] = '';

        return $this->twig->render($message->getTemplate(), $context);
    }

    private function getTestEmail(Argument $input): string
    {
        return $input->offsetGet('email');
    }
}
