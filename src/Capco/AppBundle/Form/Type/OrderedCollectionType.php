<?php

namespace Capco\AppBundle\Form\Type;

use Capco\AppBundle\Utils\Diff;
use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\PropertyAccess\PropertyAccessorInterface;

class OrderedCollectionType extends CollectionType
{
    private $propertyAccessor;

    public function __construct(PropertyAccessorInterface $propertyAccessor)
    {
        $this->propertyAccessor = $propertyAccessor;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        parent::buildForm($builder, $options);
        $builder->addEventListener(FormEvents::SUBMIT, function (FormEvent $event) use ($options) {
            $parentForm = $event->getForm()->getParent();
            if (!$parentForm) {
                throw new \LogicException('The OrderedCollectionType must be used within a form');
            }
            $parent = $parentForm->getData();
            $onUpdate = $options['on_update'];
            $field = $event->getForm()->getName();
            $collectionInDb = $this->propertyAccessor->getValue($parent, $field);
            $userCollection = new ArrayCollection($event->getData());
            $position = 0;
            if ($collectionInDb instanceof ArrayCollection) {
                foreach ($userCollection as $item) {
                    $item->setPosition(++$position);
                    $this->propertyAccessor->setValue($parent, $field, [$item]);
                }
            } else {
                foreach ($userCollection as $item) {
                    $match = $collectionInDb
                        ->filter(static function ($i) use ($item) {
                            return $item->getId() && $i->getId() === $item->getId();
                        })
                        ->first();
                    if ($match) {
                        // If the submitted data contains an item in DB, update it with submitted data
                        // TODO: Maybe find a way to automatically detect change between item from db and submitted item
                        // and calls the appropriate setter with PropertyAccessor, but for the moment it will do the job
                        if ($onUpdate) {
                            $onUpdate($match, $item);
                        }
                        $this->propertyAccessor->setValue($match, 'position', ++$position);
                    } elseif (!$item->getId()) {
                        // Else, it is a creation
                        $this->propertyAccessor->setValue($item, 'position', ++$position);
                        $this->propertyAccessor->setValue(
                            $parent,
                            $field,
                            array_merge(
                                $this->propertyAccessor->getValue($parent, $field)->toArray(),
                                [$item]
                            )
                        );
                    }
                }
                foreach (
                    Diff::fromCollectionsWithId($collectionInDb, $userCollection)
                    as $itemToDelete
                ) {
                    $items = $this->propertyAccessor->getValue($parent, $field);
                    $this->propertyAccessor->setValue(
                        $parent,
                        $field,
                        $items->filter(static function ($i) use ($itemToDelete) {
                            return $i->getId() !== $itemToDelete->getId();
                        })
                    );
                }
            }
        });
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        parent::configureOptions($resolver);
        $resolver->setDefaults([
            'on_update' => null,
            'mapped' => false,
            'allow_add' => true,
            'allow_delete' => true,
            'by_reference' => false,
            'delete_empty' => true
        ]);
    }
}
