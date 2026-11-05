<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\Questions\MediaQuestion;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\Service\MediaAccessResolver;
use Capco\AppBundle\Service\MediaHtmlReferences;
use Capco\AppBundle\Service\PrivateMediaUpload;
use Doctrine\Bundle\DoctrineBundle\EventSubscriber\EventSubscriberInterface;
use Doctrine\ORM\Event\OnFlushEventArgs;
use Doctrine\ORM\Events;
use GraphQL\Error\Error;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\Security\Core\Security;

class PrivateMediaSubscriber implements EventSubscriberInterface
{
    /** @var array<string, Media> */
    private array $pendingUploads = [];

    public function __construct(private readonly MediaHtmlReferences $html, private readonly PrivateMediaUpload $uploads, private readonly MediaAccessResolver $access, private readonly Security $security) {}

    public function getSubscribedEvents(): array
    {
        return [Events::onFlush, Events::postFlush, Events::onClear];
    }

    public function onFlush(OnFlushEventArgs $event): void
    {
        $this->pendingUploads = [];
        $em = $event->getEntityManager();
        $uow = $em->getUnitOfWork();
        $responses = [...$uow->getScheduledEntityInsertions(), ...$uow->getScheduledEntityUpdates(), ...$uow->getScheduledEntityDeletions()];
        foreach ($uow->getScheduledEntityUpdates() as $entity) {
            if ($entity instanceof MediaQuestion && (true === ($uow->getEntityChangeSet($entity)['private'][1] ?? false)
                || true === ($uow->getEntityChangeSet($entity)['hidden'][1] ?? false))) {
                $responses = [...$responses, ...$em->getRepository(MediaResponse::class)->findBy(['question' => $entity])];
            }
        }
        foreach ([...$uow->getScheduledCollectionUpdates(), ...$uow->getScheduledCollectionDeletions()] as $collection) {
            $responses[] = $collection->getOwner();
        }
        // Check existing permissions before adding any new response-based access grant.
        foreach ($responses as $response) {
            if (!$response instanceof ValueResponse || !MediaAccessResolver::isPrivateResponse($response) || !\is_string($response->getValue())) {
                continue;
            }
            foreach ($this->html->references($response->getValue()) as $media) {
                if ($this->access->isPrivate($media) && !$this->access->canView($media, $this->security->getUser())) {
                    $em->clear();

                    throw new Error('Private media cannot be reused without access.', null, null, [], null, new UserError('Private media access denied.'), [
                        'code' => 'MEDIA_REUSE_DENIED',
                        'field' => 'value',
                        'questionId' => GlobalId::toGlobalId('Question', $response->getQuestion()->getId()),
                        'mediaReference' => $media->getProviderReference(),
                    ]);
                }
            }
        }
        $responseIds = [];
        $medias = [];
        foreach ($responses as $response) {
            if ($response instanceof ValueResponse && MediaAccessResolver::isPrivateResponse($response) && \is_string($response->getValue())) {
                foreach ($this->html->references($response->getValue()) as $media) {
                    if ('1' === $media->getMetadataValue('private_attachment')) {
                        $metadata = $media->getProviderMetadata() ?? [];
                        $metadata['private_html_responses'] = array_values(array_unique([...($metadata['private_html_responses'] ?? []), $response->getId()]));
                        $media->setProviderMetadata($metadata);
                        $medias[] = $media;
                        $uow->recomputeSingleEntityChangeSet($em->getClassMetadata(Media::class), $media);
                    }
                }
            }
            if (!$response instanceof MediaResponse || !MediaAccessResolver::isPrivateResponse($response)) {
                continue;
            }
            $responseIds[$response->getId()] = $response->getId();
            foreach ($response->getMedias() as $media) {
                $medias[] = $media;
            }
        }
        if ($responseIds) {
            // A cleared or replaced collection may have already lost its snapshot.
            /** @var list<Media> $previousMedias */
            $previousMedias = $em->createQuery('SELECT m FROM ' . Media::class . ' m WHERE m.id IN (
                SELECT attached.id FROM ' . MediaResponse::class . ' response JOIN response.medias attached WHERE response.id IN (:responses)
            )')->setParameter('responses', array_values($responseIds))->getResult();
            $medias = [...$medias, ...$previousMedias];
        }

        /** @var Media $media */
        foreach ($medias as $media) {
            $this->pendingUploads[$media->getId()] = $media;
            if ('1' !== $media->getMetadataValue(MediaAccessResolver::PRIVATE_ATTACHMENT)) {
                $media->setMetadataValue(MediaAccessResolver::PRIVATE_ATTACHMENT, '1');
                $uow->recomputeSingleEntityChangeSet($em->getClassMetadata(Media::class), $media);
            }
        }
    }

    public function postFlush(): void
    {
        foreach ($this->pendingUploads as $media) {
            $this->uploads->forget($media);
        }
        $this->pendingUploads = [];
    }

    public function onClear(): void
    {
        $this->pendingUploads = [];
    }
}
