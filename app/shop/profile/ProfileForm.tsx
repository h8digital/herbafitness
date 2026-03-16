'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'

export default function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    full_name: profile.full_name || '',
    phone: profile.phone || '',
    cpf: profile.cpf || '',
    address_zip: profile.address_zip || '',
    address_street: profile.address_street || '',
    address_number: profile.address_number || '',
    address_complement: profile.address_complement || '',
    address_neighborhood: profile.address_neighborhood || '',
    address_city: profile.address_city || '',
    address_state: profile.address_state || '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function fetchCEP(cep: string) {
    const clean = cep.replace(/\D/g, '')
    if (clean.length !== 8) return
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
    const data = await res.json()
    if (!data.erro) {
      setForm(prev => ({
        ...prev,
        address_street: data.logradouro || '',
        address_neighborhood: data.bairro || '',
        address_city: data.localidade || '',
        address_state: data.uf || '',
      }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await supabase.from('profiles').update(form).eq('id', profile.id)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
    setLoading(false)
  }

  const inputClass = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5"

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Status do cadastro */}
      <div className={`rounded-2xl px-5 py-4 flex items-center gap-3 ${
        profile.status === 'approved' ? 'bg-green-50 border border-green-200' :
        profile.status === 'rejected' ? 'bg-red-50 border border-red-200' :
        'bg-yellow-50 border border-yellow-200'
      }`}>
        <span className="text-2xl">
          {profile.status === 'approved' ? '✅' : profile.status === 'rejected' ? '❌' : '⏳'}
        </span>
        <div>
          <p className={`font-semibold text-sm ${
            profile.status === 'approved' ? 'text-green-800' :
            profile.status === 'rejected' ? 'text-red-800' : 'text-yellow-800'
          }`}>
            {profile.status === 'approved' ? 'Cadastro Aprovado' :
             profile.status === 'rejected' ? 'Cadastro Rejeitado — Entre em contato' :
             'Cadastro Aguardando Aprovação'}
          </p>
          <p className={`text-xs mt-0.5 ${
            profile.status === 'approved' ? 'text-green-600' :
            profile.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
          }`}>
            {profile.status === 'approved'
              ? 'Você tem acesso completo à loja.'
              : profile.status === 'rejected'
              ? 'Seu cadastro foi rejeitado. Entre em contato com o suporte.'
              : 'Seu cadastro está sendo analisado. Em breve você terá acesso.'}
          </p>
        </div>
      </div>

      {/* Dados pessoais */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Dados Pessoais</h3>
        <div>
          <label className={labelClass}>Nome Completo</label>
          <input className={inputClass} value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Seu nome completo" />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input className={`${inputClass} bg-slate-50 text-slate-400`} value={profile.email || ''} disabled />
          <p className="text-xs text-slate-400 mt-1">O email não pode ser alterado.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Telefone</label>
            <input className={inputClass} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(11) 99999-9999" />
          </div>
          <div>
            <label className={labelClass}>CPF</label>
            <input className={inputClass} value={form.cpf} onChange={e => set('cpf', e.target.value)} placeholder="000.000.000-00" />
          </div>
        </div>
      </div>

      {/* Endereço */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Endereço Principal</h3>
        <div>
          <label className={labelClass}>CEP</label>
          <input className={inputClass} value={form.address_zip}
            onChange={e => { set('address_zip', e.target.value); fetchCEP(e.target.value) }}
            placeholder="00000-000" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className={labelClass}>Rua</label>
            <input className={inputClass} value={form.address_street} onChange={e => set('address_street', e.target.value)} placeholder="Nome da rua" />
          </div>
          <div>
            <label className={labelClass}>Número</label>
            <input className={inputClass} value={form.address_number} onChange={e => set('address_number', e.target.value)} placeholder="Nº" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Complemento</label>
            <input className={inputClass} value={form.address_complement} onChange={e => set('address_complement', e.target.value)} placeholder="Apto, bloco..." />
          </div>
          <div>
            <label className={labelClass}>Bairro</label>
            <input className={inputClass} value={form.address_neighborhood} onChange={e => set('address_neighborhood', e.target.value)} placeholder="Bairro" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className={labelClass}>Cidade</label>
            <input className={inputClass} value={form.address_city} onChange={e => set('address_city', e.target.value)} placeholder="Cidade" />
          </div>
          <div>
            <label className={labelClass}>Estado</label>
            <input className={inputClass} value={form.address_state} onChange={e => set('address_state', e.target.value)} placeholder="SP" maxLength={2} />
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading}
        className={`w-full font-semibold py-3 rounded-xl transition-all ${saved ? 'bg-green-500 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'} disabled:opacity-60`}>
        {loading ? 'Salvando...' : saved ? '✓ Salvo com sucesso!' : 'Salvar Alterações'}
      </button>
    </form>
  )
}
