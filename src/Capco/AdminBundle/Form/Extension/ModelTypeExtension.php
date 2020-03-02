<?php

namespace Capco\AdminBundle\Form\Extension;

use Doctrine\ORM\EntityManagerInterface;
use Sonata\AdminBundle\Form\Type\ModelType;
use Symfony\Component\Form\AbstractTypeExtension;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ModelTypeExtension extends AbstractTypeExtension
{
    protected $em;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'tree' => false
        ]);
    }

    public function buildView(FormView $view, FormInterface $form, array $options)
    {
        if (isset($options['tree']) && $options['tree']) {
            $view->vars['tree'] = true;
            $view->vars['hierarchy'] = [];
            $roots = $form->getData();
            foreach ($roots as $root) {
                $children = $this->em->getRepository(\get_class($root))->childrenHierarchy($root);
                $view->vars['hierarchy'][$root->getId()] = $children;
            }
        } else {
            $view->vars['tree'] = false;
        }
        parent::buildView($view, $form, $options);
    }

    public function getExtendedTypes()
    {
        return [ModelType::class];
    }
}
