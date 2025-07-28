<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Section\Section;
use Capco\AppBundle\Form\SectionType;
use Capco\AppBundle\GraphQL\Mutation\Locale\LocaleUtils;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\SectionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;

class UpdateHomePageProjectsSectionConfigurationMutation implements MutationInterface
{
    use MutationTrait;

    final public const TOO_MANY_PROJECTS = 'TOO_MANY_PROJECTS';
    final public const INVALID_FORM = 'INVALID_FORM';

    public function __construct(private readonly EntityManagerInterface $em, private readonly SectionRepository $sectionRepository, private readonly FormFactoryInterface $formFactory, private readonly LoggerInterface $logger)
    {
    }

    public function __invoke(Argument $args): array
    {
        $this->formatInput($args);
        /**
         * @var Section $section
         */
        $section = $this->sectionRepository->findOneBy(['type' => 'projects']);

        [$nbObjects, $projects] = [$args->offsetGet('nbObjects'), $args->offsetGet('projects')];

        $arguments = $args->getArrayCopy();

        $sectionProjectsFormInput = [];
        foreach ($projects as $index => $projectId) {
            $sectionProjectsFormInput[] = [
                'section' => $section->getId(),
                'project' => $projectId,
                'position' => $index,
            ];
        }

        unset($arguments['projects']);
        $arguments['sectionProjects'] = $sectionProjectsFormInput;
        LocaleUtils::indexTranslations($arguments);

        $maxProjectsDisplay = 9;

        if ($nbObjects > $maxProjectsDisplay) {
            return [
                'homePageProjectsSectionConfiguration' => null,
                'errorCode' => self::TOO_MANY_PROJECTS,
            ];
        }

        $form = $this->formFactory->create(SectionType::class, $section);

        $form->submit($arguments, false);

        if ($form->isSubmitted() && !$form->isValid()) {
            return ['errorCode' => self::INVALID_FORM];
        }

        $this->em->persist($section);
        $this->em->flush();

        return ['homePageProjectsSectionConfiguration' => $section, 'errorCode' => null];
    }
}
