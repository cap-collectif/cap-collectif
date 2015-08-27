<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Show\ShowMapper;

class OpinionAppendixAdmin extends Admin
{

    protected $datagridValues = array(
        '_sort_order' => 'ASC',
        '_sort_by' => 'appendixType.position',
    );

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $opinionTypeId = null;

        if ($this->hasParentFieldDescription()) { // this Admin is embedded
            $opinionTypeId = $this->getParentFieldDescription()->getAdmin()->getPersistentParameters()['opinion_type_id'];
        } else {
            $opinionTypeId = $this->getRequest()->get('opinion_type_id');
        }

        $formMapper
            ->add('body', null, array(
                'label' => 'admin.fields.appendix.body',
            ))
            ->add('appendixType', null, array(
                'label' => 'admin.fields.appendix.type',
                'required' => true,
                'query_builder' => $this->createQueryBuilderForAppendixTypes($opinionTypeId),
                'attr' => [
                    'class' => 'appendix-type-js',
                    'data-sonata-select2' => 'false',
                ],
            ))
        ;
    }

    private function createQueryBuilderForAppendixTypes($opinionTypeId = null)
    {
        $qb = $this->modelManager
            ->createQuery('CapcoAppBundle:AppendixType', 'at')
            ->leftJoin('at.opinionTypes', 'atot')
            ->andWhere('atot.opinionType = :opinionTypeId')
            ->setParameter('opinionTypeId', $opinionTypeId)
        ;

        return $qb;
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(array('create', 'delete', 'edit'));
    }


}
