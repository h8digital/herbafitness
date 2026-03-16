'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const [form, setForm] = useState({
    full_name: '', email: '', password: '', confirm_password: '',
    phone: '', cpf: '', cnpj: '', company_name: '',
    address_zip: '', address_street: '', address_number: '',
    address_complement: '', address_neighborhood: '', address_city: '', address_state: '',
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
    if (form.password !== form.confirm_password) {
      setError('As senhas não coincidem.')
      return
    }
    setLoading(true)
    setError('')

    // 1. Criar usuário no Auth
    const { data, error: signupError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.full_name }
      }
    })

    if (signupError || !data.user) {
      setError(signupError?.message || 'Erro ao criar conta.')
      setLoading(false)
      return
    }

    // 2. Criar perfil diretamente (upsert garante que funciona mesmo sem trigger)
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      email: form.email,
      full_name: form.full_name,
      role: 'customer',
      status: 'pending',
      phone: form.phone || null,
      cpf: form.cpf || null,
      cnpj: form.cnpj || null,
      company_name: form.company_name || null,
      address_zip: form.address_zip || null,
      address_street: form.address_street || null,
      address_number: form.address_number || null,
      address_complement: form.address_complement || null,
      address_neighborhood: form.address_neighborhood || null,
      address_city: form.address_city || null,
      address_state: form.address_state || null,
    })

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError)
      // Mesmo com erro no perfil, o usuário foi criado — continua
    }

    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{fontFamily:'var(--font-display)'}}>
            Cadastro Enviado!
          </h2>
          <p className="text-slate-500 mb-6">
            Seu cadastro foi enviado para aprovação. Você será notificado quando for aprovado.
          </p>
          <Link href="/auth/login" className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors">
            Voltar ao Login
          </Link>
        </div>
      </div>
    )
  }

  const inputClass = "w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-sm"
  const labelClass = "block text-sm font-medium text-slate-700 mb-1"

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-500 rounded-2xl mb-4">
            <span className="text-white text-2xl font-bold" style={{fontFamily:'var(--font-display)'}}>M</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900" style={{fontFamily:'var(--font-display)'}}>Solicitar Cadastro</h1>
          <p className="text-slate-500 text-sm mt-1">Preencha os dados para criar sua conta</p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${step >= s ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-500'}`}>{s}</div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-orange-500' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <form onSubmit={step < 3 ? (e) => { e.preventDefault(); setStep(s => s + 1) } : handleSubmit}>

            {/* Passo 1: Dados de acesso */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 mb-4" style={{fontFamily:'var(--font-display)'}}>Dados de Acesso</h3>
                <div>
                  <label className={labelClass}>Nome Completo</label>
                  <input className={inputClass} value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Seu nome" required />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input type="email" className={inputClass} value={form.email} onChange={e => set('email', e.target.value)} placeholder="seu@email.com" required />
                </div>
                <div>
                  <label className={labelClass}>Senha</label>
                  <input type="password" className={inputClass} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Mínimo 6 caracteres" minLength={6} required />
                </div>
                <div>
                  <label className={labelClass}>Confirmar Senha</label>
                  <input type="password" className={inputClass} value={form.confirm_password} onChange={e => set('confirm_password', e.target.value)} placeholder="Repita a senha" required />
                </div>
              </div>
            )}

            {/* Passo 2: Dados pessoais */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 mb-4" style={{fontFamily:'var(--font-display)'}}>Dados Pessoais / Empresa</h3>
                <div>
                  <label className={labelClass}>Telefone</label>
                  <input className={inputClass} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(11) 99999-9999" />
                </div>
                <div>
                  <label className={labelClass}>CPF</label>
                  <input className={inputClass} value={form.cpf} onChange={e => set('cpf', e.target.value)} placeholder="000.000.000-00" />
                </div>
                <div>
                  <label className={labelClass}>CNPJ (opcional)</label>
                  <input className={inputClass} value={form.cnpj} onChange={e => set('cnpj', e.target.value)} placeholder="00.000.000/0001-00" />
                </div>
                <div>
                  <label className={labelClass}>Razão Social / Nome Fantasia (opcional)</label>
                  <input className={inputClass} value={form.company_name} onChange={e => set('company_name', e.target.value)} placeholder="Nome da empresa" />
                </div>
              </div>
            )}

            {/* Passo 3: Endereço */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 mb-4" style={{fontFamily:'var(--font-display)'}}>Endereço de Entrega</h3>
                <div>
                  <label className={labelClass}>CEP</label>
                  <input className={inputClass} value={form.address_zip}
                    onChange={e => { set('address_zip', e.target.value); fetchCEP(e.target.value) }}
                    placeholder="00000-000" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className={labelClass}>Rua</label>
                    <input className={inputClass} value={form.address_street} onChange={e => set('address_street', e.target.value)} placeholder="Rua" required />
                  </div>
                  <div>
                    <label className={labelClass}>Número</label>
                    <input className={inputClass} value={form.address_number} onChange={e => set('address_number', e.target.value)} placeholder="Nº" required />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Complemento</label>
                  <input className={inputClass} value={form.address_complement} onChange={e => set('address_complement', e.target.value)} placeholder="Apto, bloco..." />
                </div>
                <div>
                  <label className={labelClass}>Bairro</label>
                  <input className={inputClass} value={form.address_neighborhood} onChange={e => set('address_neighborhood', e.target.value)} placeholder="Bairro" required />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className={labelClass}>Cidade</label>
                    <input className={inputClass} value={form.address_city} onChange={e => set('address_city', e.target.value)} placeholder="Cidade" required />
                  </div>
                  <div>
                    <label className={labelClass}>Estado</label>
                    <input className={inputClass} value={form.address_state} onChange={e => set('address_state', e.target.value)} placeholder="SP" maxLength={2} required />
                  </div>
                </div>
                {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <button type="button" onClick={() => setStep(s => s - 1)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl transition-colors">
                  Voltar
                </button>
              )}
              <button type="submit" disabled={loading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-3 px-4 rounded-xl transition-colors">
                {step < 3 ? 'Próximo' : loading ? 'Enviando...' : 'Enviar Cadastro'}
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-slate-500 mt-4">
            Já tem conta? <Link href="/auth/login" className="text-orange-500 hover:text-orange-600 font-medium">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
