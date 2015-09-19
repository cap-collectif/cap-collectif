<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\ConsultationType;
use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\Opinion;

class OpinionTypeAdmin extends Admin
{
    public function getPersistentParameters()
    {
        $subject = $this->getSubject();
        $consultationTypeId = null;
        $consultationTypeName = null;

        if ($this->hasParentFieldDescription() && $this->getParentFieldDescription()->getAdmin()->getSubject()) {
            $consultationTypeId = $this->getParentFieldDescription()->getAdmin()->getSubject()->getId();
        } elseif ($subject && $subject->getConsultationType()) {
            $consultationTypeId = $subject->getConsultationType()->getId();
        } elseif ($subject && $subject->getRoot()) {
            $root = $this
                ->getConfigurationPool()
                ->getContainer()
                ->get('doctrine.orm.entity_manager')
                ->getRepository('CapcoAppBundle:OpinionType')
                ->find($subject->getRoot())
            ;
            if ($root) {
                $consultationTypeId = $root->getConsultationType()->getId();
            }
        }

        if ($consultationTypeId === null) {
            $consultationTypeId = $this->getRequest()->get('consultation_type_id');
        }

        $consultationTypeName = $this->getRequest()->get('consultation_type_name');

        return array(
            'consultation_type_id' => $consultationTypeId,
            'consultation_type_name' => $consultationTypeName,
        );
    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->with('admin.fields.opinion_type.group_info', array('class' => 'col-md-12'))->end()
            ->with('admin.fields.opinion_type.group_options', array('class' => 'col-md-12'))->end()
            ->with('admin.fields.opinion_type.group_votes', array('class' => 'col-md-6'))->end()
            ->with('admin.fields.opinion_type.group_contribution', array('class' => 'col-md-6'))->end()
            ->with('admin.fields.opinion_type.group_appendices', array('class' => 'col-md-12'))->end()
            ->end()
        ;

        $formMapper
            // Info
            ->with('admin.fields.opinion_type.group_info')
            ->add('title', null, array(
                'label' => 'admin.fields.opinion_type.title',
            ))
            ->add('subtitle', null, array(
                'label' => 'admin.fields.opinion_type.subtitle',
            ))
            ->add('parent', 'sonata_type_model', [
                'label' => 'admin.fields.opinion_type.parent',
                'required' => false,
                'query' => $this->createQueryForParent(),
                'btn_add' => false,
            ])
            ->add('position', null, array(
                'label' => 'admin.fields.opinion_type.position',
            ))
            ->end()

            // Options
            ->with('admin.fields.opinion_type.group_options')
            ->add('color', 'choice', array(
                'label' => 'admin.fields.opinion_type.color',
                'choices' => OpinionType::$colorsType,
                'translation_domain' => 'CapcoAppBundle',
            ))
            ->add('defaultFilter', 'choice', array(
                'label' => 'admin.fields.opinion_type.default_filter',
                'choices' => Opinion::$sortCriterias,
                'translation_domain' => 'CapcoAppBundle',
            ))
            ->end()

            ->with('admin.fields.opinion_type.group_votes')
            ->add('voteWidgetType', 'choice', array(
                'label' => 'admin.fields.opinion_type.vote_widget_type',
                'choices' => OpinionType::$voteWidgetLabels,
                'translation_domain' => 'CapcoAppBundle',
                'required' => true,
            ))
            ->add('votesHelpText', 'textarea', array(
                'label' => 'admin.fields.opinion_type.votes_help_text',
                'required' => false,
            ))
            ->add('votesThreshold', 'integer', array(
                'label' => 'admin.fields.opinion_type.votes_threshold',
                'required' => false,
            ))
            ->add('votesThresholdHelpText', 'textarea', array(
                'label' => 'admin.fields.opinion_type.votes_threshold_help_text',
                'required' => false,
            ))
            ->end()

            ->with('admin.fields.opinion_type.group_contribution')
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.opinion_type.is_enabled',
                'required' => false,
            ))
            ->add('versionable', null, array(
                'label' => 'admin.fields.opinion_type.versionable',
                'required' => false,
            ))
            ->add('sourceable', null, array(
                'label' => 'admin.fields.opinion_type.sourceable',
                'required' => false,
            ))
            ->add('commentSystem', 'choice', array(
                'label' => 'admin.fields.opinion_type.comment_system',
                'choices' => OpinionType::$commentSystemLabels,
                'translation_domain' => 'CapcoAppBundle',
                'required' => true,
            ))
            ->end()

            // Appendices
            ->with('admin.fields.opinion_type.group_appendices')
            ->add('appendixTypes', 'sonata_type_collection', [
                'label' => 'admin.fields.opinion_type.appendices',
                'by_reference' => false,
                'required' => false,
            ], [
                'edit' => 'inline',
                'inline' => 'table',
                'sortable' => 'position',
            ])
            ->end()
        ;
    }

    private function createQueryForParent()
    {
        $consultationTypeId = $this->getPersistentParameter('consultation_type_id');

        $qb = $this->getConfigurationPool()
            ->getContainer()
            ->get('doctrine.orm.entity_manager')
            ->getRepository('CapcoAppBundle:OpinionType')
            ->createQueryBuilder('ot')
            ->where('ot.root IN (
                SELECT ot2.id
                FROM CapcoAppBundle:OpinionType ot2
                LEFT JOIN ot2.consultationType ct
                WHERE ot2.parent IS NULL
                AND ct.id = ?0
            )')
            ->setParameter(0, $consultationTypeId)
        ;

        if ($this->getSubject()->getId()) {
            $qb
                ->andWhere('ot.id != ?1')
                ->setParameter(1, $this->getSubject()->getId())
            ;
        }

        return $qb->getQuery();
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['create', 'edit', 'delete']);
    }

    public function getTemplate($name)
    {
        if ($name === 'edit' || $name === 'create') {
            return 'CapcoAdminBundle:OpinionType:edit.html.twig';
        }

        return parent::getTemplate($name); // TODO: Change the autogenerated stub
    }

    public function prePersist($type)
    {
        if (!$type->getParent() && !$type->getConsultationType()) {
            $consultationTypeId = $this->getPersistentParameter('consultation_type_id');
            if ($consultationTypeId !== null) {
                $consultationType = $this->getConfigurationPool()
                    ->getContainer()
                    ->get('doctrine.orm.entity_manager')
                    ->getRepository('CapcoAppBundle:ConsultationType')
                    ->find($consultationTypeId);
                $type->setConsultationType($consultationType);
            } else {
                $consultationType = new ConsultationType();
                $title = $this->getPersistentParameter('consultation_type_name') ? $this->getPersistentParameter('consultation_type_name') : 'Défaut';
                $consultationType->setTitle($title);
                $type->setConsultationType($consultationType);
            }
        }
    }

    public function postPersist($object)
    {
        $this->verifyTree();
    }

    public function postUpdate($object)
    {
        $this->verifyTree();
    }

    public function postRemove($object)
    {
        $this->verifyTree();
    }

    public function verifyTree()
    {
        $em = $this->getConfigurationPool()
            ->getContainer()
            ->get('doctrine.orm.entity_manager')
        ;
        $repo = $em
            ->getRepository('CapcoAppBundle:OpinionType')
        ;
        $repo->verify();
        $repo->recover();
        $em->flush();
    }
}
