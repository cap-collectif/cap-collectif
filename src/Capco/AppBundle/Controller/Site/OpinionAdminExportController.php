<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Logger\ActionLogger;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\HeaderUtils;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\PropertyAccess\PropertyAccess;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * Same file as the former Sonata export (/admin/capco/app/opinion/export?format=csv): the mapped fields of the
 * entity, formatted by sonata-project/exporter, for the opinions of the back-office list.
 */
class OpinionAdminExportController extends AbstractController
{
    // Order of the Doctrine mapping, as returned by the Sonata ModelManager::getExportFields()
    private const FIELDS = [
        'updatedAt',
        'position',
        'ranking',
        'bodyUsingJoditWysiwyg',
        'moderationToken',
        'pinned',
        'published',
        'publishedAt',
        'slug',
        'title',
        'body',
        'createdAt',
        'trashedStatus',
        'trashedAt',
        'trashedReason',
        'id',
    ];
    private const CSV_DELIMITER = ';';
    private const BATCH_SIZE = 500;

    public function __construct(
        private readonly OpinionRepository $opinionRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly TranslatorInterface $translator,
        private readonly ActionLogger $actionLogger
    ) {}

    /**
     * @Route("/export-opinions", name="app_export_opinions", options={"i18n" = false})
     *
     * @Security("is_granted('ROLE_ADMIN')")
     */
    public function exportAction(Request $request): Response
    {
        $viewer = $this->getUser();
        if (!$viewer instanceof User) {
            throw $this->createAccessDeniedException();
        }
        // Like Sonata, the file follows the filter of the list.
        $search = $request->query->get('search');
        $search = \is_string($search) && '' !== trim($search) ? $search : null;

        $this->actionLogger->logExport($viewer, 'des propositions');

        $response = new StreamedResponse(function () use ($viewer, $search): void {
            $output = fopen('php://output', 'w');
            if (false === $output) {
                throw new \RuntimeException('Could not open the CSV output stream.');
            }

            // Sonata translated each field name as a label: only "title" has a translation.
            fputcsv(
                $output,
                array_map(fn (string $field) => $this->translator->trans($field, [], 'CapcoAppBundle'), self::FIELDS),
                self::CSV_DELIMITER
            );

            $propertyAccessor = PropertyAccess::createPropertyAccessor();
            $count = 0;
            foreach ($this->opinionRepository->iterateAdmin($viewer, $search) as $opinion) {
                fputcsv(
                    $output,
                    array_map(
                        fn (string $field) => self::formatValue($propertyAccessor->getValue($opinion, $field)),
                        self::FIELDS
                    ),
                    self::CSV_DELIMITER
                );

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
                sprintf('export_opinion_%s.csv', (new \DateTime())->format('Y_m_d_H_i_s'))
            )
        );

        return $response;
    }

    /**
     * Same formatting as Sonata\Exporter\Source\AbstractPropertySourceIterator::getValue() for these fields.
     */
    private static function formatValue(mixed $value): bool|float|int|string|null
    {
        if ($value instanceof \DateTimeInterface) {
            return $value->format('r');
        }

        return \is_scalar($value) || null === $value ? $value : null;
    }
}
