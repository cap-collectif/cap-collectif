<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class PrivateMediaUpload
{
    private const SESSION_KEY = 'pending_private_media';

    public function __construct(private readonly EntityManagerInterface $em, private readonly RequestStack $requests) {}

    public function isPrivate(?string $questionId): bool
    {
        if (!$questionId) {
            return false;
        }
        $id = GlobalId::fromGlobalId($questionId)['id'] ?: $questionId;
        $question = $this->em->find(AbstractQuestion::class, $id);
        if (!$question) {
            throw new BadRequestHttpException('Unknown upload question.');
        }

        return $question->isPrivate() || $question->getHidden() || null !== $question->getQuestionnaireAbstractQuestion()?->getQuestionnaire();
    }

    public function remember(Media $media): void
    {
        $request = $this->requests->getCurrentRequest();
        if ($request?->hasSession()) {
            $pending = $request->getSession()->get(self::SESSION_KEY, []);
            $pending[$media->getId()] = time();
            $request->getSession()->set(self::SESSION_KEY, array_filter($pending, static fn (int $created): bool => $created > time() - 86400));
        }
    }

    public function ownsPending(Media $media): bool
    {
        $request = $this->requests->getCurrentRequest();

        return $request?->hasSession() && ($request->getSession()->get(self::SESSION_KEY, [])[$media->getId()] ?? 0) > time() - 86400;
    }

    public function forget(Media $media): void
    {
        $request = $this->requests->getCurrentRequest();
        if ($request?->hasSession()) {
            $pending = $request->getSession()->get(self::SESSION_KEY, []);
            unset($pending[$media->getId()]);
            $request->getSession()->set(self::SESSION_KEY, $pending);
        }
    }
}
