<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Logger\ActionLogger;
use Capco\AppBundle\Repository\NewsletterSubscriptionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\HeaderUtils;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

class NewsletterSubscriptionExportController extends AbstractController
{
    private const CSV_DELIMITER = ';';
    private const BATCH_SIZE = 500;

    public function __construct(
        private readonly NewsletterSubscriptionRepository $newsletterSubscriptionRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly TranslatorInterface $translator,
        private readonly ActionLogger $actionLogger
    ) {
    }

    /**
     * @Route("/export-newsletter-subscriptions", name="app_export_newsletter_subscriptions", options={"i18n" = false})
     * @Security("is_granted('ROLE_ADMIN')")
     */
    public function exportAction(): Response
    {
        $this->actionLogger->logExport($this->getUser(), 'des inscrits à la lettre d\'information');

        $response = new StreamedResponse(function (): void {
            $output = fopen('php://output', 'w');
            if (false === $output) {
                throw new \RuntimeException('Could not open the CSV output stream.');
            }

            // UTF-8 BOM so that spreadsheet software detects the encoding
            fwrite($output, "\xEF\xBB\xBF");
            fputcsv($output, [
                $this->translator->trans('admin.fields.newsletter_subscription.email', [], 'CapcoAppBundle'),
                $this->translator->trans('admin.fields.newsletter_subscription.is_enabled', [], 'CapcoAppBundle'),
                $this->translator->trans('admin.fields.newsletter_subscription.created_at', [], 'CapcoAppBundle'),
            ], self::CSV_DELIMITER);

            $yes = $this->translator->trans('global.yes', [], 'CapcoAppBundle');
            $no = $this->translator->trans('global.no', [], 'CapcoAppBundle');
            $count = 0;
            foreach ($this->newsletterSubscriptionRepository->iterateAllOrderedByEmail() as $subscription) {
                fputcsv($output, [
                    $subscription->getEmail(),
                    $subscription->getIsEnabled() ? $yes : $no,
                    $subscription->getCreatedAt()->format('Y-m-d H:i:s'),
                ], self::CSV_DELIMITER);

                // Keep memory usage flat on large lists
                if (0 === ++$count % self::BATCH_SIZE) {
                    $this->entityManager->clear();
                }
            }

            fclose($output);
        });

        $response->headers->set('Content-Type', 'text/csv; charset=UTF-8');
        $response->headers->set(
            'Content-Disposition',
            HeaderUtils::makeDisposition(
                HeaderUtils::DISPOSITION_ATTACHMENT,
                sprintf('newsletter_subscriptions_%s.csv', (new \DateTime())->format('Y-m-d'))
            )
        );

        return $response;
    }
}
