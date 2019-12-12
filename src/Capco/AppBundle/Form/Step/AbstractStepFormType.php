<?php

namespace Capco\AppBundle\Form\Step;

use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Form\RequirementType;
use Capco\AppBundle\Utils\Diff;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\PersistentCollection;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\OptionsResolver\OptionsResolver;

abstract class AbstractStepFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('type', null, [
                'mapped' => false
            ])
            ->add('title')
            ->add('label')
            ->add('isEnabled')
            ->add('requirementsReason')
            ->add('requirements', CollectionType::class, [
                'mapped' => false,
                'allow_add' => true,
                'allow_delete' => true,
                'by_reference' => false,
                'entry_type' => RequirementType::class,
                'delete_empty' => true
            ]);
        $builder->addEventListener(FormEvents::SUBMIT, function (FormEvent $event) {
            /** @var AbstractStep $step */
            $step = $event->getData();
            /** @var Requirement[]|Collection $dbRequirements */
            $dbRequirements = $step->getRequirements();
            $userRequirements = new ArrayCollection(
                $event
                    ->getForm()
                    ->get('requirements')
                    ->getData()
            );
            $position = 0;
            if ($dbRequirements instanceof ArrayCollection) {
                // Here, we are in a creation and no particular behaviour is required so we simply add them
                foreach ($userRequirements as $requirement) {
                    $requirement->setPosition(++$position);
                    $step->addRequirement($requirement);
                }
            } elseif ($dbRequirements instanceof PersistentCollection) {
                foreach ($userRequirements as $requirement) {
                    /** @var Requirement|null $match */
                    $match = $dbRequirements
                        ->filter(static function (Requirement $r) use ($requirement) {
                            return $requirement->getId() && $r->getId() === $requirement->getId();
                        })
                        ->first();
                    if ($match) {
                        // If the submitted data contains a requirement in DB, update it with submitted data
                        $match
                            ->setLabel($requirement->getLabel())
                            ->setType($requirement->getType())
                            ->setPosition(++$position);
                    } elseif (!$requirement->getId()) {
                        // Else, it is a creation
                        $requirement->setPosition(++$position);
                        $step->addRequirement($requirement);
                    }
                }

                foreach (
                    Diff::fromCollectionsWithId($dbRequirements, $userRequirements)
                    as $requirementToDelete
                ) {
                    $step->removeRequirement($requirementToDelete);
                }
            }
        });
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => AbstractStep::class
        ]);
    }
}
