<?php

namespace Capco\AppBundle\Font;

use Capco\AppBundle\Entity\Font;
use Capco\AppBundle\Repository\FontRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;

class FontManager
{
    public function __construct(
        private readonly FontRepository $repository,
        private readonly EntityManagerInterface $em,
        private readonly LoggerInterface $logger
    ) {
    }

    public function deleteFont(Font $toDelete): void
    {
        if (!$toDelete->isCustom()) {
            $this->logger->error('Tried to remove a non-custom font.', compact('toDelete'));

            throw new \InvalidArgumentException('Tried to remove a non-custom font.');
        }

        $default = $this->repository->getDefaultFont();

        if (!$default) {
            throw new \LogicException('Could not get default font.');
        }

        if ($toDelete->getUseAsHeading()) {
            $this->changeHeadingFont($default);
        }

        if ($toDelete->getUseAsBody()) {
            $this->changeBodyFont($default);
        }

        foreach ($this->repository->getSameFamilyFonts($toDelete) as $font) {
            $this->em->remove($font);
        }

        $this->em->flush();
    }

    public function changeHeadingFont(Font $newFont): void
    {
        $this->deactivateHeadingFonts();
        foreach ($this->repository->findBy(['name' => $newFont->getName()]) as $font) {
            $font->setUseAsHeading(true);
        }

        $this->em->flush();
    }

    public function changeBodyFont(Font $newFont): void
    {
        $this->deactivateBodyFonts();
        foreach ($this->repository->findBy(['name' => $newFont->getName()]) as $font) {
            $font->setUseAsBody(true);
        }

        $this->em->flush();
    }

    private function deactivateHeadingFonts(): void
    {
        foreach ($this->repository->getActiveHeadingFonts() as $headingFont) {
            $headingFont->setUseAsHeading(false);
        }
    }

    private function deactivateBodyFonts(): void
    {
        foreach ($this->repository->getActiveBodyFonts() as $bodyFont) {
            $bodyFont->setUseAsBody(false);
        }
    }

    private function deactivateFonts(): void
    {
        $this->deactivateBodyFonts();
        $this->deactivateHeadingFonts();

        $this->em->flush();
    }
}
